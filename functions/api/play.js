export async function onRequestPost(context) {
  const { request, env } = context;
  
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  
  const { won, guesses, country, date } = body;
  
  const KEY = 'wordography_stats';
  let stats = { total: 0, wins: 0, by_date: {} };
  
  try {
    const existing = await env.STATS.get(KEY, 'json');
    if (existing) stats = existing;
  } catch (e) {
    // KV not available — use in-memory (won't persist across invocations)
  }
  
  stats.total++;
  if (won) stats.wins++;
  
  const playDate = date || new Date().toISOString().split('T')[0];
  if (!stats.by_date[playDate]) {
    stats.by_date[playDate] = { plays: 0, wins: 0 };
  }
  stats.by_date[playDate].plays++;
  if (won) stats.by_date[playDate].wins++;
  
  try {
    await env.STATS.put(KEY, JSON.stringify(stats));
  } catch (e) {
    // Silently fail if KV not bound — stats won't persist
  }
  
  return new Response(JSON.stringify({ ok: true, total: stats.total }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
