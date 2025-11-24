const { supabaseAdmin } = require('./_lib/supabase');
const { reconcileBookingsWithCalendar } = require('./_lib/bookings');

const isAdmin = (req) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'jeroen@jeroenandpaws.com';
  const headerEmail = (req.headers['x-admin-email'] || '').toLowerCase();
  return headerEmail && headerEmail === adminEmail.toLowerCase();
};

module.exports = async (req, res) => {
  if (req.method === 'PATCH') {
    if (!isAdmin(req)) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Admin email required' }));
      return;
    }

    const { id, status } = req.body || {};
    const normalizedStatus = (status || '').toLowerCase();
    const allowedStatuses = ['pending', 'scheduled', 'confirmed', 'cancelled', 'canceled'];

    if (!id || !allowedStatuses.includes(normalizedStatus)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Booking id and valid status are required' }));
      return;
    }

    const updateResult = await supabaseAdmin
      .from('bookings')
      .update({ status: normalizedStatus })
      .eq('id', id)
      .select('*, clients(full_name,email), services_catalog(*), booking_pets(pet_id)')
      .maybeSingle();

    if (updateResult.error || !updateResult.data) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to update booking status' }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ booking: updateResult.data }));
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, PATCH');
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

  const bookings = await reconcileBookingsWithCalendar(result.data || []);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ bookings }));
};