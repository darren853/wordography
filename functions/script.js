// Umami proxy script - serves cached Umami tracker from analytics.snappydo.xyz
// Makes tracker first-party to wordography.pages.dev

const UMAMI_URL = 'https://analytics.snappydo.xyz/script.js';
const CACHE_KEY = 'umami-script-v1';
const CACHE_TTL = 86400; // 24 hours

export async function onRequest(context) {
  const cache = caches.default;
  let response = await cache.match(CACHE_KEY);
  
  if (!response) {
    response = await fetch(UMAMI_URL, {
      cf: { cacheEverything: true, cacheTtl: CACHE_TTL }
    });
    
    const body = await response.text();
    // Rewrite internal references
    const rewritten = body
      .replace(/https:\/\/analytics\.snappydo\.xyz\//g, '/')
      .replace(/analytics\.snappydo\.xyz/g, 'wordography.pages.dev');
    
    response = new Response(rewritten, {
      headers: {
        'Content-Type': 'application/javascript; charset=UTF-8',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      }
    });
    
    await cache.put(CACHE_KEY, response.clone());
  }
  
  return response;
}
