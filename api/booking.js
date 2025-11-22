const { supabaseAdmin } = require('./_lib/supabase');

const isAdmin = (req) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'jeroen@jeroenandpaws.com';
  const headerEmail = (req.headers['x-admin-email'] || '').toLowerCase();
  return headerEmail && headerEmail === adminEmail.toLowerCase();
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method Not Allowed');
    return;
  }

  if (!isAdmin(req)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: 'Admin email required' }));
    return;
  }

  const emailFilter = (req.query.email || '').toLowerCase();

  let query = supabaseAdmin
    .from('bookings')
    .select('*, clients(full_name,email), services_catalog(*), booking_pets(pet_id)')
    .order('start_at', { ascending: false })
    .limit(50);

  if (emailFilter) {
    query = query.eq('clients.email', emailFilter);
  }

  const result = await query;

  if (result.error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Failed to load bookings' }));
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ bookings: result.data || [] }));
};