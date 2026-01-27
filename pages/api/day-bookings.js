import { getAppOnlyAccessToken } from "./_lib/auth";
import { listCalendarEvents } from "./_lib/graph";

const normalizeEircode = (value) =>
  (value || "").replace(/\s+/g, "").toUpperCase();

const extractEircode = ({ location, subject, bodyPreview }) => {
  const maybeEircode = [location, subject, bodyPreview]
    .filter(Boolean)
    .map((value) => normalizeEircode(String(value)))
    .find((value) => /[A-Z0-9]{3}[A-Z0-9]{4}/.test(value));

  return maybeEircode || "";
};

const normalizeCalendarBookings = (calendarEvents = []) =>
  calendarEvents
    .map((event) => ({
      id: `calendar:${event.id}`,
      calendar_event_id: event.id,
      start_at: event.start?.dateTime,
      end_at: event.end?.dateTime,
      client_address:
        extractEircode({
          location: event.location?.displayName,
          subject: event.subject,
          bodyPreview: event.bodyPreview,
        }) || event.location?.displayName || "",
      source: "calendar",
    }))
    .filter((entry) => entry.start_at && entry.end_at)
    .sort((a, b) =>
      String(a.start_at).localeCompare(String(b.start_at))
    );

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET").end("Method Not Allowed");
    return;
  }

  try {
    const date = (req.query?.date || "").slice(0, 10);

    if (!date) {
      res.status(400).json({ message: "date query param is required" });
      return;
    }

    const startOfDay = `${date}T00:00:00Z`;
    const endOfDay = `${date}T23:59:59Z`;

    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    let calendarEvents = [];

    if (calendarId) {
      try {
        const accessToken = await getAppOnlyAccessToken();
        calendarEvents = (
          await listCalendarEvents({
            accessToken,
            calendarId,
            start: startOfDay,
            end: endOfDay,
          })
        )
          .filter((event) => !event.isCancelled)
          .filter(
            (event) =>
              (event.showAs || "busy").toLowerCase() !== "free"
          );
      } catch (calendarError) {
        console.error(
          "Day bookings calendar fetch error",
          calendarError
        );
      }
    }

    res
      .status(200)
      .json({ bookings: normalizeCalendarBookings(calendarEvents) });
  } catch (fetchError) {
    console.error("Day bookings fetch error", fetchError);
    res.status(500).json({ message: "Failed to load bookings" });
  }
}
