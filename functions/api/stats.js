export async function onRequestGet(context) {
  const { env } = context;
  
  const KEY = 'wordography_stats';
  let stats = { total: 0, wins: 0, by_date: {} };
  
  try {
    const existing = await env.STATS.get(KEY, 'json');
    if (existing) stats = existing;
  } catch (e) {
    // KV not available
  }
  
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
  
  let week = 0, month = 0, year = 0;
  for (const [d, data] of Object.entries(stats.by_date || {})) {
    if (d >= yearAgo) year += data.plays || 0;
    if (d >= monthAgo) month += data.plays || 0;
    if (d >= weekAgo) week += data.plays || 0;
  }
  
  return new Response(JSON.stringify({
    total_plays: stats.total,
    plays_today: stats.by_date?.[today]?.plays || 0,
    plays: stats.by_date?.[today]?.plays || 0,  // alias for Horizon panel
    plays_this_week: week,
    plays_this_month: month,
    plays_this_year: year,
    wins: stats.wins
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
