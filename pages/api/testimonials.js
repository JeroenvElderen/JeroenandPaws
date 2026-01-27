const { supabaseAdmin, requireSupabase } = require('./_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method Not Allowed');
    return;
  }

  requireSupabase();

  const limit = Number.parseInt(req.query.limit, 10);
  let query = supabaseAdmin
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true });

  if (Number.isFinite(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Failed to load testimonials' }));
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ testimonials: data || [] }));
};