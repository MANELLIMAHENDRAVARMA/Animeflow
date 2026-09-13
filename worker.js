export default {
  async fetch(request) {
    return new Response("AnimeFlow backend is working!", {
      headers: { "content-type": "text/plain" }
    });
  }
};
