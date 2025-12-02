const { getAppOnlyAccessToken } = require('./_lib/auth');
const { getEvent } = require('./_lib/graph');
const {
  cancelBookingByCalendarEventId,
  syncBookingFromCalendarEvent,
} = require('./_lib/bookings');

const respondToValidation = (req, res) => {
  const token = req.query?.validationToken;

  if (!token) return false;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(token);
  return true;
};

const isAuthorizedNotification = (notification) => {
  const expectedState = process.env.GRAPH_WEBHOOK_SECRET;
  if (!expectedState) return true;
  return notification?.clientState === expectedState;
};

module.exports = async (req, res) => {
  if (respondToValidation(req, res)) return;

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  const notifications = Array.isArray(req.body?.value) ? req.body.value : [];

  if (!notifications.length) {
    res.statusCode = 202;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ processed: 0 }));
    return;
  }

  const calendarId = process.env.OUTLOOK_CALENDAR_ID;
  let accessToken = null;

  try {
    accessToken = await getAppOnlyAccessToken();
  } catch (error) {
    console.error('Calendar webhook token error', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Unable to authorize calendar webhook' }));
    return;
  }

  for (const notification of notifications) {
    if (!isAuthorizedNotification(notification)) {
      continue;
    }

    const eventId = notification?.resourceData?.id;
    if (!eventId || !calendarId) {
      continue;
    }

    try {
      if (notification?.changeType === 'deleted') {
        await cancelBookingByCalendarEventId(eventId);
        continue;
      }

      const eventResult = await getEvent({ accessToken, calendarId, eventId });

      if (!eventResult?.exists || eventResult?.event?.isCancelled) {
        await cancelBookingByCalendarEventId(eventId);
        continue;
      }

      await syncBookingFromCalendarEvent(eventId, eventResult.event);
    } catch (error) {
      console.error('Failed to process calendar webhook notification', {
        eventId,
        error,
      });
    }
  }

  res.statusCode = 202;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ processed: notifications.length }));
};