const { requireSupabase, supabaseAdmin } = require('./supabase');
const { getAppOnlyAccessToken } = require('./auth');
const { getEvent } = require('./graph');

const normalizeStatus = (status = '') => (status || '').toLowerCase();
const isCancelledStatus = (status = '') => ['cancelled', 'canceled'].includes(normalizeStatus(status));

const cancelBookingInSupabase = async (
  bookingId,
  { clientId, select = '*' } = {}
) => {
  if (!bookingId) return null;

  let query = supabaseAdmin
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const deleteResult = await query.select(select).maybeSingle();

  if (deleteResult.error) {
    throw deleteResult.error;
  }

  if (!deleteResult.data) {
    return { id: bookingId, deleted: true };
  }

  return { ...deleteResult.data, status: 'cancelled', deleted: true };
};

const reconcileBookingsWithCalendar = async (bookings = []) => {
  requireSupabase();

  const calendarId = process.env.OUTLOOK_CALENDAR_ID;
  if (!calendarId) return bookings;

  let accessToken = null;
  try {
    accessToken = await getAppOnlyAccessToken();
  } catch (authError) {
    console.error('Calendar auth failed for booking reconciliation', authError);
    return bookings;
  }

  const hydratedBookings = [];

  for (const booking of bookings) {
    if (!booking?.calendar_event_id || isCancelledStatus(booking?.status)) {
      hydratedBookings.push(booking);
      continue;
    }

    try {
      const event = await getEvent({
        accessToken,
        calendarId,
        eventId: booking.calendar_event_id,
      });

      if (!event?.exists || event?.event?.isCancelled) {
        try {
          const updatedBooking = await cancelBookingInSupabase(booking.id);
          if (!updatedBooking?.deleted) {
            hydratedBookings.push(updatedBooking || booking);
          }
          continue;
        } catch (cancelError) {
          console.error('Booking cancel failed during calendar reconciliation', {
          });
        }
      }
    } catch (calendarCheckError) {
      console.error('Booking calendar check failed', {
        bookingId: booking.id,
        error: calendarCheckError,
      });
    }

    hydratedBookings.push(booking);
  }

  return hydratedBookings;
};

module.exports = { reconcileBookingsWithCalendar, cancelBookingInSupabase };