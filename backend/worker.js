import './polyfill.js';
import serverless from 'serverless-http';
import db from './database.js';

export default {
  async fetch(request, env, ctx) {
    if (env.DB) {
      db.bindD1(env.DB);
    }
    
    // Inject env variables so process.env reads them safely in server.js
    if (env.STRIPE_SECRET_KEY) globalThis.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
    if (env.PAYMOB_API_KEY) globalThis.PAYMOB_API_KEY = env.PAYMOB_API_KEY;
    if (env.PAYMOB_INTEGRATION_ID) globalThis.PAYMOB_INTEGRATION_ID = env.PAYMOB_INTEGRATION_ID;
    if (env.PAYMOB_IFRAME_ID) globalThis.PAYMOB_IFRAME_ID = env.PAYMOB_IFRAME_ID;
    if (env.PAYMOB_HMAC_SECRET) globalThis.PAYMOB_HMAC_SECRET = env.PAYMOB_HMAC_SECRET;

    globalThis.IS_CLOUDFLARE = true;
    const appModule = await import('./server.js');
    const app = appModule.default || appModule;
    const handler = serverless(app);
    
    const url = new URL(request.url);
    const event = {
      version: '2.0',
      routeKey: '$default',
      rawPath: url.pathname,
      rawQueryString: url.search,
      headers: Object.fromEntries(request.headers.entries()),
      requestContext: {
        http: {
          method: request.method,
          path: url.pathname,
          protocol: 'HTTP/1.1',
          sourceIp: request.headers.get('cf-connecting-ip'),
          userAgent: request.headers.get('user-agent'),
        },
      },
      body: request.body ? await request.text() : undefined,
      isBase64Encoded: false,
    };
    
    try {
      const result = await handler(event, ctx);
      return new Response(result.body, {
        status: result.statusCode,
        headers: result.headers,
      });
    } catch(err) {
      console.error('Handler threw error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
