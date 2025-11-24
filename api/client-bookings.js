const { supabaseAdmin, requireSupabase } = require('./_lib/supabase');
const { getAppOnlyAccessToken } = require('./_lib/auth');
const { deleteEvent } = require('./_lib/graph');
const {
  reconcileBookingsWithCalendar,
  cancelBookingInSupabase,
} = require('./_lib/bookings');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      requireSupabase();

      const clientEmail = (req.query.email || '').toLowerCase();

      if (!clientEmail) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Client email is required' }));
        return;
      }

      const clientResult = await supabaseAdmin
        .from('clients')
        .select('id')
        .ilike('email', clientEmail)
        .maybeSingle();

      if (clientResult.error || !clientResult.data) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Client not found' }));
        return;
      }

      const bookingsResult = await supabaseAdmin
        .from('bookings')
        .select('*, services_catalog(*), booking_pets(pet_id)')
        .eq('client_id', clientResult.data.id)
        .order('start_at', { ascending: false });

      if (bookingsResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to load bookings' }));
        return;
      }

      const reconciledBookings = await reconcileBookingsWithCalendar(
        bookingsResult.data || []
      );

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ bookings: reconciledBookings }));
      return;
    } catch (error) {
      console.error('Client bookings fetch error', error);
      res.statusCode = error?.statusCode || 500;
      res.end(JSON.stringify({ message: error?.publicMessage || 'Failed to load bookings' }));
      return;
    }
  }
  
  if (req.method === 'PATCH') {
    try {
      requireSupabase();

      const { bookingId, clientEmail } = req.body || {};
      const normalizedEmail = (clientEmail || '').toLowerCase();
      const calendarId = process.env.OUTLOOK_CALENDAR_ID;
      let calendarAccessToken = null;

      if (calendarId) {
        try {
          calendarAccessToken = await getAppOnlyAccessToken();
        } catch (calendarAuthError) {
          console.error(
            'Calendar auth failed for booking cancellation',
            calendarAuthError
          );
        }
      }

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
        .select('id, client_id, status, calendar_event_id')
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

      const bookingEventId = bookingResult.data?.calendar_event_id;

      let updatedBooking = null;
      try {
        updatedBooking = await cancelBookingInSupabase(bookingId, {
          clientId: clientResult.data.id,
          select: '*, services_catalog(*), booking_pets(pet_id)',
        });
      } catch (updateError) {
        console.error('Failed to cancel booking for client', updateError);
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to cancel booking' }));
        return;
      }

      if (calendarAccessToken && calendarId && bookingEventId) {
        try {
          await deleteEvent({
            accessToken: calendarAccessToken,
            calendarId,
            eventId: bookingEventId,
          });
        } catch (deleteError) {
          console.error('Failed to delete calendar event for booking', deleteError);
        }
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ booking: updatedBooking }));
      return;
    } catch (error) {
      console.error('Client booking update error', error);
      res.statusCode = error?.statusCode || 500;
      res.end(JSON.stringify({ message: error?.publicMessage || 'Failed to update booking' }));
      return;
    }
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, PATCH');
  res.end('Method Not Allowed');
};
