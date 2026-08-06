import './polyfill.js';
import db from './database.js';
import honoApp from './hono-api.js';

export default {
  async fetch(request, env, ctx) {
    if (env.DB) {
      db.bindD1(env.DB);
    }
    
    // Inject env variables safely
    if (env.STRIPE_SECRET_KEY) globalThis.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
    if (env.PAYMOB_API_KEY) globalThis.PAYMOB_API_KEY = env.PAYMOB_API_KEY;
    if (env.PAYMOB_INTEGRATION_ID) globalThis.PAYMOB_INTEGRATION_ID = env.PAYMOB_INTEGRATION_ID;
    if (env.PAYMOB_IFRAME_ID) globalThis.PAYMOB_IFRAME_ID = env.PAYMOB_IFRAME_ID;
    if (env.PAYMOB_HMAC_SECRET) globalThis.PAYMOB_HMAC_SECRET = env.PAYMOB_HMAC_SECRET;
    if (env.ADMIN_PASSWORD) globalThis.ADMIN_PASSWORD = env.ADMIN_PASSWORD;

    globalThis.IS_CLOUDFLARE = true;
    const url = new URL(request.url);

    // Serve frontend assets if it's not an API request
    if (!url.pathname.startsWith('/api') && env.ASSETS) {
      let assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404 && !url.pathname.includes('.')) {
        // SPA Fallback
        const indexReq = new Request(new URL('/index.html', url.origin), request);
        return env.ASSETS.fetch(indexReq);
      }
      return assetRes;
    }

    try {
      return await honoApp.fetch(request, env, ctx);
    } catch(err) {
      console.error('Handler threw error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
