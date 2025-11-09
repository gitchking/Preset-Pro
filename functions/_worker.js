// This file ensures proper environment binding for Cloudflare Pages Functions
export default {
  async fetch(request, env, ctx) {
    // This will be handled by individual function files
    return new Response('Not found', { status: 404 });
  }
};