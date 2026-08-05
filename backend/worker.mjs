import serverless from 'serverless-http';
import app from './server.js';
import db from './database.js';

const handler = serverless(app);

export default {
  async fetch(request, env, ctx) {
    // Pass the Cloudflare D1 instance to our database adapter
    if (env.DB) {
      db.bindD1(env.DB);
    }
    
    // Inject env variables so process.env reads them safely in server.js
    if (!process.env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY) {
      process.env.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
    }
    if (!process.env.PAYMOB_API_KEY && env.PAYMOB_API_KEY) {
      process.env.PAYMOB_API_KEY = env.PAYMOB_API_KEY;
    }
    if (!process.env.PAYMOB_INTEGRATION_ID && env.PAYMOB_INTEGRATION_ID) {
      process.env.PAYMOB_INTEGRATION_ID = env.PAYMOB_INTEGRATION_ID;
    }
    if (!process.env.PAYMOB_IFRAME_ID && env.PAYMOB_IFRAME_ID) {
      process.env.PAYMOB_IFRAME_ID = env.PAYMOB_IFRAME_ID;
    }
    if (!process.env.PAYMOB_HMAC_SECRET && env.PAYMOB_HMAC_SECRET) {
      process.env.PAYMOB_HMAC_SECRET = env.PAYMOB_HMAC_SECRET;
    }


    // serverless-http handles the Fetch API request conversion to Express Node.js format
    return handler(request, ctx);
  }
};
