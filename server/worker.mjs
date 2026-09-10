import { videoApi } from './volcengine.mjs';

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/video/')) {
      return videoApi(request, env);
    }

    if (!env.ASSETS?.fetch) {
      return new Response('Static asset binding is unavailable.', { status: 503 });
    }

    return env.ASSETS.fetch(request);
  },
};
