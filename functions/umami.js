export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Forward to real Umami server via Cloudflare Tunnel
  const umamiResponse = await fetch('https://analytics.snappydo.xyz/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': context.request.headers.get('User-Agent') || 'Cloudflare-Pages-Functions',
      'X-Forwarded-For': context.request.headers.get('CF-Connecting-IP') || '',
      'Referer': context.request.headers.get('Referer') || '',
      'Origin': context.request.headers.get('Origin') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await umamiResponse.json();
  return new Response(JSON.stringify(data), {
    status: umamiResponse.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
