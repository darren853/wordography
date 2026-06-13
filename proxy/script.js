export async function onRequest(context) {
  const url = new URL(context.request.url);
  const cacheKey = 'umami-script-v2';
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (!response) {
    response = await fetch('https://analytics.snappydo.xyz/script.js', {
      cf: { cacheEverything: true, cacheTtl: 86400 }
    });
    const body = await response.text();
    // Rewrite Umami's own API calls to go through our proxy
    // The script makes POSTs to /umami and may reference the Umami hostname
    const modified = body
      .replace(/\.analytics\.snappydo\.xyz/g, '')
      .replace(/https?:\/\/analytics\.snappydo\.xyz\//g, '/')
      .replace(/analytics\.snappydo\.xyz/g, '');
    response = new Response(modified, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}
