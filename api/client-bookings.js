const { DateTime } = require('luxon');
const { supabaseAdmin, requireSupabase, findAdjacentBookings, resolveBookingTimes } = require('./_lib/supabase');
const { getAppOnlyAccessToken } = require('./_lib/auth');
const { deleteEvent, updateEvent } = require('./_lib/graph');
const {
  buildCalendarBody,
  buildCalendarSubject,
  buildCalendarCategories,
} = require('./_lib/calendar-events');
const {
  reconcileBookingsWithCalendar,
  cancelBookingInSupabase,
} = require('./_lib/bookings');
const { DEFAULT_HOME_ADDRESS, validateTravelWindow } = require('./_lib/travel');

const RESCHEDULE_MIN_NOTICE_HOURS = Number.parseInt(
  process.env.RESCHEDULE_MIN_NOTICE_HOURS || '24',
  10
);
const DEFAULT_OWNER_EMAIL = 'jeroen@jeroenandpaws.com';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const resolveOwnerEmail = () =>
  normalizeEmail(process.env.ADMIN_EMAIL || DEFAULT_OWNER_EMAIL);

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      requireSupabase();

      const clientEmail = normalizeEmail(req.query.email || '');

      if (!clientEmail) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Client email is required' }));
        return;
      }

      const ownerEmail = resolveOwnerEmail();
      const clientResult = await supabaseAdmin
        .from('clients')
        .select('id')
        .ilike('email', clientEmail)
        .maybeSingle();

      if (clientResult.error || !clientResult.data) {
        if (clientEmail !== ownerEmail) {
          res.statusCode = 404;
          res.end(JSON.stringify({ message: 'Client not found' }));
          return;
        }
      }

      const buildBookingsQuery = () =>
        supabaseAdmin
          .from('bookings')
          .select('*, services_catalog(*), booking_pets(pet_id)')
          .order('start_at', { ascending: false });

      const bookingsResult = clientResult.data
        ? await buildBookingsQuery().eq('client_id', clientResult.data.id)
        : { data: [] };
      let accessResult = { data: [] };

      if (clientEmail === ownerEmail) {
        accessResult = await buildBookingsQuery().contains('access_emails', [
          clientEmail,
        ]);
      }

      if (bookingsResult.error || accessResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to load bookings' }));
        return;
      }

      const combinedBookings = [
        ...(bookingsResult.data || []),
        ...(accessResult.data || []),
      ];
      const uniqueBookings = combinedBookings.filter(
        (booking, index, all) =>
          all.findIndex((item) => item.id === booking.id) === index
      );

      const reconciledBookings = await reconcileBookingsWithCalendar(
        uniqueBookings
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

      const { bookingId, clientEmail, action } = req.body || {};
      const normalizedEmail = normalizeEmail(clientEmail || '');
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
        .select('id, client_id, status, calendar_event_id, start_at, end_at, time_zone, client_address, service_title, access_emails, services_catalog(duration_minutes)')
        .eq('id', bookingId)
        .maybeSingle();

      if (bookingResult.error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to load booking' }));
        return;
      }

      const hasAccess =
        bookingResult.data?.client_id === clientResult.data.id ||
        (bookingResult.data?.access_emails || []).includes(normalizedEmail);

      if (!bookingResult.data || !hasAccess) {
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

      if (action === 'reschedule') {
        const { date, time, timeZone, durationMinutes } = req.body || {};

        if (!date || !time) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Date and time are required to reschedule.' }));
          return;
        }

        const durationFromBooking = bookingResult.data?.services_catalog?.duration_minutes;
        const fallbackDuration = (() => {
          const start = DateTime.fromISO(bookingResult.data?.start_at || '', { zone: 'UTC' });
          const end = DateTime.fromISO(bookingResult.data?.end_at || '', { zone: 'UTC' });
          if (start.isValid && end.isValid) {
            return Math.max(15, Math.round(end.diff(start, 'minutes').minutes));
          }
          return 60;
        })();

        const duration = Number.isFinite(Number(durationMinutes))
          ? Number(durationMinutes)
          : Number.isFinite(durationFromBooking)
          ? durationFromBooking
          : fallbackDuration;

        const resolvedTimeZone = timeZone || bookingResult.data?.time_zone || 'UTC';
        const { start, end } = resolveBookingTimes({
          date,
          time,
          durationMinutes: duration,
          timeZone: resolvedTimeZone,
        });

        const now = DateTime.now().setZone(resolvedTimeZone);
        const minNoticeHours = Number.isNaN(RESCHEDULE_MIN_NOTICE_HOURS)
          ? 24
          : Math.max(1, RESCHEDULE_MIN_NOTICE_HOURS);
        const earliestAllowed = now.plus({ hours: minNoticeHours });

        if (start.toMillis() < earliestAllowed.toMillis()) {
          res.statusCode = 422;
          res.end(JSON.stringify({
            message: `Reschedules must be at least ${minNoticeHours} hours in advance. Please choose a later time.`,
          }));
          return;
        }

        const conflictCheck = await supabaseAdmin
          .from('bookings')
          .select('id')
          .neq('id', bookingId)
          .lt('start_at', end.toUTC().toISO())
          .gt('end_at', start.toUTC().toISO())
          .not('status', 'in', '(cancelled,canceled)')
          .limit(1)
          .maybeSingle();

        if (conflictCheck?.data?.id) {
          res.statusCode = 409;
          res.end(JSON.stringify({ message: 'That slot was just booked. Please choose another time.' }));
          return;
        }

        const adjacent = await findAdjacentBookings({
          start: start.toUTC().toISO(),
          end: end.toUTC().toISO(),
          excludeBookingId: bookingId,
        });

        const travel = await validateTravelWindow({
          start,
          end,
          clientAddress: bookingResult.data?.client_address,
          previousBooking: adjacent.previous,
          nextBooking: adjacent.next,
          baseAddress:
            process.env.TRAVEL_HOME_ADDRESS ||
            process.env.HOME_BASE_ADDRESS ||
            DEFAULT_HOME_ADDRESS,
        });

        if (!travel.ok) {
          res.statusCode = 409;
          res.end(JSON.stringify({ message: travel.message }));
          return;
        }

        const updateResult = await supabaseAdmin
          .from('bookings')
          .update({
            start_at: start.toUTC().toISO(),
            end_at: end.toUTC().toISO(),
            time_zone: resolvedTimeZone,
          })
          .eq('id', bookingId)
          .select('*, services_catalog(*), booking_pets(pet_id)')
          .maybeSingle();

        if (updateResult.error || !updateResult.data) {
          res.statusCode = 500;
          res.end(JSON.stringify({ message: 'Failed to update booking' }));
          return;
        }

        if (calendarAccessToken && calendarId && bookingEventId) {
          try {
            await updateEvent({
              accessToken: calendarAccessToken,
              calendarId,
              eventId: bookingEventId,
              updates: {
                subject: buildCalendarSubject({
                  serviceTitle: updateResult.data.service_title,
                  status: 'rescheduled',
                }),
                start: { dateTime: start.toUTC().toISO(), timeZone: resolvedTimeZone },
                end: { dateTime: end.toUTC().toISO(), timeZone: resolvedTimeZone },
                location: updateResult.data.client_address
                  ? { displayName: updateResult.data.client_address }
                  : undefined,
                body: {
                  contentType: 'Text',
                  content: buildCalendarBody({
                    serviceTitle: updateResult.data.service_title,
                    status: 'rescheduled',
                  }),
                },
                categories: buildCalendarCategories({
                  status: 'rescheduled',
                  serviceTitle: updateResult.data.service_title,
                }),
                attendees: normalizedEmail
                  ? [
                      {
                        emailAddress: { address: normalizedEmail },
                        type: 'required',
                      },
                    ]
                  : [],
              },
            });
          } catch (updateError) {
            console.error('Failed to update calendar event for booking', updateError);
          }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ booking: updateResult.data }));
        return;
      }

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
