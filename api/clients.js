const { supabaseAdmin, ensureClientProfile } = require('./_lib/supabase');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const email = (req.query.email || '').toLowerCase();

    if (!email) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Email is required' }));
      return;
    }

    const clientResult = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (clientResult.error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to load client' }));
      return;
    }

    if (!clientResult.data) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'Client not found' }));
      return;
    }

    const petsResult = await supabaseAdmin
      .from('pets')
      .select('*')
      .eq('owner_id', clientResult.data.id)
      .order('created_at', { ascending: false });

    const bookingsResult = await supabaseAdmin
      .from('bookings')
      .select('*, services_catalog(*), booking_pets(pet_id)')
      .eq('client_id', clientResult.data.id)
      .order('start_at', { ascending: false });

    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        client: clientResult.data,
        pets: petsResult.data || [],
        bookings: bookingsResult.data || [],
      })
    );
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { email, fullName, phone } = body;

      const result = await ensureClientProfile({
        email,
        fullName,
        phone,
      });

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
      return;
    } catch (error) {
      console.error('Client upsert error', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to upsert client' }));
      return;
    }
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST');
  res.end('Method Not Allowed');
};