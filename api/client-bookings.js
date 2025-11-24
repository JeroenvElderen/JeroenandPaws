const { supabaseAdmin, requireSupabase } = require('./_lib/supabase');

module.exports = async (req, res) => {
  if (req.method === 'PATCH') {
    try {
      requireSupabase();

      const { bookingId, clientEmail } = req.body || {};
      const normalizedEmail = (clientEmail || '').toLowerCase();

      if (!bookingId || !normalizedEmail) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Booking id and client email are required' }));
        return;
      }

      const clientResult = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (clientResult.error || !clientResult.data) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Client not found' }));
        return;
      }

      const bookingResult = await supabaseAdmin
        .from('bookings')
        .select('id, client_id, status')
        .eq('id', bookingId)
        .maybeSingle();

      if (bookingResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to load booking' }));
        return;
      }

      if (!bookingResult.data || bookingResult.data.client_id !== clientResult.data.id) {
        res.statusCode = 403;
        res.end(JSON.stringify({ message: 'Booking not found for this client' }));
        return;
      }

      if ((bookingResult.data.status || '').toLowerCase() === 'cancelled') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          booking: bookingResult.data,
          message: 'Booking already cancelled',
        }));
        return;
      }

      const updateResult = await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('client_id', clientResult.data.id)
        .select('*, services_catalog(*), booking_pets(pet_id)')
        .single();

      if (updateResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to cancel booking' }));
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ booking: updateResult.data }));
      return;
    } catch (error) {
      console.error('Client booking update error', error);
      res.statusCode = error?.statusCode || 500;
      res.end(JSON.stringify({ message: error?.publicMessage || 'Failed to update booking' }));
      return;
    }
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'PATCH');
  res.end('Method Not Allowed');
};
