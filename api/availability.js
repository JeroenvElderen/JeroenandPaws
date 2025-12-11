const { getAppOnlyAccessToken } = require("./_lib/auth");
const { getSchedule, listCalendarEvents } = require("./_lib/graph");

const extractEircode = (value = "") => {
  const match = String(value)
    .toUpperCase()
    .match(/([A-Z0-9]{3}[\s-]?[A-Z0-9]{4})/);
  return match ? match[1] : "";
};

const deriveEventAddress = (event = {}) => {
  const location = event?.location || {};
  const display =
    location.displayName ||
    location?.address?.text ||
    location?.address?.street ||
    "";

  const resolvedEircode = extractEircode(display);
  return (resolvedEircode || display || "").trim();
};

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Method Not Allowed" }));
    return;
  }

  try {
    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    if (!calendarId) {
      throw new Error("Missing OUTLOOK_CALENDAR_ID env var");
    }

    const { durationMinutes } = req.query || {};
    const serviceDurationMinutes = Number.parseInt(durationMinutes, 10);

    const accessToken = await getAppOnlyAccessToken();
    const windowDays = Number.parseInt(
      process.env.WINDOW_DAYS ?? "365",
      10
    );

    const windowStart = new Date();
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + windowDays);

    const availability = await getSchedule({
      accessToken,
      calendarId,
      windowDays: Number.isNaN(windowDays) ? 21 : Math.max(windowDays, 1),
      serviceDurationMinutes: Number.isNaN(serviceDurationMinutes)
        ? undefined
        : serviceDurationMinutes,
    });

    let calendarStops = [];
    try {
      const events = await listCalendarEvents({
        accessToken,
        calendarId,
        startDateTime: windowStart.toISOString(),
        endDateTime: windowEnd.toISOString(),
      });

      calendarStops = (events || [])
        .map((event) => {
          const startAt = event?.start?.dateTime;
          const endAt = event?.end?.dateTime;
          if (!startAt || !endAt) return null;

          return {
            start_at: startAt,
            end_at: endAt,
            client_address: deriveEventAddress(event),
          };
        })
        .filter(Boolean);
    } catch (calendarError) {
      console.error("Calendar event fetch failed", calendarError);
    }

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      ...availability,
      stops: calendarStops,
    }));
  } catch (error) {
    console.error("Availability error", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json"); // ← critical fix
    res.end(JSON.stringify({ message: "Failed to fetch availability" }));
  }
};
