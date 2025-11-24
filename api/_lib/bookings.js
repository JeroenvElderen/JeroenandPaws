const { deleteBookingById, requireSupabase } = require('./supabase');
const { getAppOnlyAccessToken } = require('./auth');
const { getEvent } = require('./graph');

const normalizeStatus = (status = '') => (status || '').toLowerCase();
const isCancelledStatus = (status = '') => ['cancelled', 'canceled'].includes(normalizeStatus(status));

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
          await deleteBookingById(booking.id);
          continue;
        } catch (deleteError) {
          console.error('Booking delete failed during calendar reconciliation', {
            bookingId: booking.id,
            error: deleteError,
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

module.exports = { reconcileBookingsWithCalendar };