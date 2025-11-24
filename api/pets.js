const { supabaseAdmin } = require('./_lib/supabase');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const ownerEmail = (req.query.ownerEmail || '').toLowerCase();

    if (!ownerEmail) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Owner email is required' }));
      return;
    }

    const clientResult = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', ownerEmail)
      .maybeSingle();

    if (clientResult.error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to load owner' }));
      return;
    }

    if (!clientResult.data) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'Owner not found' }));
      return;
    }

    const petsResult = await supabaseAdmin
      .from('pets')
      .select('*')
      .eq('owner_id', clientResult.data.id)
      .order('created_at', { ascending: false });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ pets: petsResult.data || [] }));
    return;
  }

  if (req.method === 'POST') {
    try {
      const { ownerEmail, name, breed, notes, photoDataUrl } = req.body || {};
      const normalizedEmail = (ownerEmail || '').toLowerCase();

      const clientResult = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (clientResult.error || !clientResult.data) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Owner not found' }));
        return;
      }

      const insertResult = await supabaseAdmin
        .from('pets')
        .insert({
          owner_id: clientResult.data.id,
          name: name || 'New pet',
          breed: breed || null,
          notes: notes || null,
          photo_data_url: photoDataUrl || null,
        })
        .select('*')
        .single();

      if (insertResult.error) {
        throw insertResult.error;
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ pet: insertResult.data }));
      return;
    } catch (error) {
      console.error('Pet creation error', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to save pet' }));
      return;
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ownerEmail, name, breed, notes, photoDataUrl } = req.body || {};
      const normalizedEmail = (ownerEmail || '').toLowerCase();

      if (!id || !normalizedEmail) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Pet id and owner email are required' }));
        return;
      }

      const clientResult = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (clientResult.error || !clientResult.data) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Owner not found' }));
        return;
      }

      const updateResult = await supabaseAdmin
        .from('pets')
        .update({
          name: name || 'New pet',
          breed: breed || null,
          notes: notes || null,
          photo_data_url: photoDataUrl || null,
        })
        .eq('id', id)
        .eq('owner_id', clientResult.data.id)
        .select('*')
        .single();

      if (updateResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to update pet' }));
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ pet: updateResult.data }));
      return;
    } catch (error) {
      console.error('Pet update error', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Failed to update pet' }));
      return;
    }
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST, PUT');
  res.end('Method Not Allowed');
};