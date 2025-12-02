const { requireSupabase, supabaseAdmin } = require('./supabase');
const { getAppOnlyAccessToken } = require('./auth');
const { getEvent } = require('./graph');

const normalizeStatus = (status = '') => (status || '').toLowerCase();
const isCancelledStatus = (status = '') => ['cancelled', 'canceled'].includes(normalizeStatus(status));

const parseGraphDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const cancelBookingInSupabase = async (
  bookingId,
  { clientId, select = '*' } = {}
) => {
  if (!bookingId) return null;

  let query = supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled', calendar_event_id: null, recurrence: null })
    .eq('id', bookingId);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const updateResult = await query.select(select).maybeSingle();

  if (updateResult.error) {
    throw updateResult.error;
  }

  return updateResult.data;
};

const findBookingByCalendarEventId = async (eventId) =>
  supabaseAdmin
    .from('bookings')
    .select('id, status, calendar_event_id')
    .eq('calendar_event_id', eventId)
    .maybeSingle();

const cancelBookingByCalendarEventId = async (eventId) => {
  requireSupabase();

  if (!eventId) return null;

  const bookingResult = await findBookingByCalendarEventId(eventId);

  if (bookingResult.error || !bookingResult.data) {
    return null;
  }

  return cancelBookingInSupabase(bookingResult.data.id);
};

const syncBookingFromCalendarEvent = async (eventId, event = {}) => {
  requireSupabase();

  if (!eventId) return null;

  const bookingResult = await findBookingByCalendarEventId(eventId);

  if (bookingResult.error || !bookingResult.data) {
    return null;
  }

  if (event.isCancelled) {
    return cancelBookingInSupabase(bookingResult.data.id);
  }

  const updatePayload = {};

  const startAt = parseGraphDateTime(event?.start?.dateTime);
  const endAt = parseGraphDateTime(event?.end?.dateTime);
  const timeZone = event?.start?.timeZone || event?.end?.timeZone;

  if (startAt) updatePayload.start_at = startAt;
  if (endAt) updatePayload.end_at = endAt;
  if (timeZone) updatePayload.time_zone = timeZone;

  if (Object.keys(updatePayload).length === 0) {
    return bookingResult.data;
  }

  const updateResult = await supabaseAdmin
    .from('bookings')
    .update(updatePayload)
    .eq('id', bookingResult.data.id)
    .select('*, services_catalog(*), booking_pets(pet_id)')
    .maybeSingle();

  if (updateResult.error || !updateResult.data) {
    return bookingResult.data;
  }

  return updateResult.data;
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
          hydratedBookings.push(updatedBooking || booking);
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

module.exports = {
  reconcileBookingsWithCalendar,
  cancelBookingInSupabase,
  cancelBookingByCalendarEventId,
  syncBookingFromCalendarEvent,
};