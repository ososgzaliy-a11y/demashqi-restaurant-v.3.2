export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Pass through requests for static assets (files with extensions)
    if (pathname.match(/\.[a-zA-Z0-9]+$/)) {
      return env.ASSETS.fetch(request);
    }

    // For all SPA routes, serve index.html
    const indexRequest = new Request(new URL('/index.html', url.origin).toString(), request);
    return env.ASSETS.fetch(indexRequest);
  },
};
