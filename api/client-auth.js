const { supabaseAdmin, hashPassword, requireSupabase } = require('./_lib/supabase');

const normalizeEmail = (value = '') => (value || '').trim().toLowerCase();

const buildProfile = async (clientId) => {
  const clientResult = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientResult.error) {
    throw clientResult.error;
  }

  const petsResult = await supabaseAdmin
    .from('pets')
    .select('*')
    .eq('owner_id', clientId)
    .order('created_at', { ascending: false });

  if (petsResult.error) {
    throw petsResult.error;
  }

  const bookingsResult = await supabaseAdmin
    .from('bookings')
    .select('*, services_catalog(*), booking_pets(pet_id)')
    .eq('client_id', clientId)
    .order('start_at', { ascending: false });

  if (bookingsResult.error) {
    throw bookingsResult.error;
  }

  return {
    client: clientResult.data,
    pets: petsResult.data || [],
    bookings: bookingsResult.data || [],
  };
};

const handleConfigError = (res, error) => {
  const status = error?.statusCode || 503;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      message: error?.publicMessage || 'Service is temporarily unavailable.',
    })
  );
};

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      requireSupabase();
      const body = req.body || {};
      const email = normalizeEmail(body.email);
      const password = body.password || '';

      if (!email || !password) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Email and password are required.' }));
        return;
      }

      const clientResult = await supabaseAdmin
        .from('clients')
        .select('id, email, full_name, hashed_password')
        .eq('email', email)
        .maybeSingle();

      if (clientResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to check your profile.' }));
        return;
      }

      const client = clientResult.data;

      if (!client) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Client not found.' }));
        return;
      }

      if (!client.hashed_password) {
        res.statusCode = 403;
        res.end(
          JSON.stringify({
            message: 'Please set a password to access your profile.',
            needsPassword: true,
          })
        );
        return;
      }

      if (client.hashed_password !== hashPassword(password)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ message: 'Incorrect password.' }));
        return;
      }

      const profile = await buildProfile(client.id);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(profile));
      return;
    } catch (error) {
      if (error?.statusCode === 503) {
        handleConfigError(res, error);
        return;
      }

      console.error('Client auth error', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Unable to authenticate.' }));
      return;
    }
  }

  if (req.method === 'PUT') {
    try {
      requireSupabase();
      const body = req.body || {};
      const email = normalizeEmail(body.email);
      const password = body.password || '';

      if (!email || !password) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Email and password are required.' }));
        return;
      }

      if (password.length < 8) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Password must be at least 8 characters long.' }));
        return;
      }

      const clientResult = await supabaseAdmin
        .from('clients')
        .select('id, email, full_name, hashed_password')
        .eq('email', email)
        .maybeSingle();

      if (clientResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Unable to verify your account.' }));
        return;
      }

      const client = clientResult.data;

      if (!client) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Client not found.' }));
        return;
      }

      if (client.hashed_password) {
        res.statusCode = 409;
        res.end(JSON.stringify({ message: 'A password has already been set for this account.' }));
        return;
      }

      const updateResult = await supabaseAdmin
        .from('clients')
        .update({ hashed_password: hashPassword(password), password_setup_token: null })
        .eq('id', client.id)
        .select('*')
        .single();

      if (updateResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Could not save your password.' }));
        return;
      }

      const profile = await buildProfile(client.id);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(profile));
      return;
    } catch (error) {
      if (error?.statusCode === 503) {
        handleConfigError(res, error);
        return;
      }

      console.error('Password setup error', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Unable to set password.' }));
      return;
    }
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'POST, PUT');
  res.end('Method Not Allowed');
};