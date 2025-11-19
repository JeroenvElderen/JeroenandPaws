const { getAppOnlyAccessToken } = require("./_lib/auth");
const { createEvent } = require("./_lib/graph");

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

const addMinutesToDateTime = (date, time, minutes) => {
  const start = new Date(`${date}T${time}:00Z`);
  start.setUTCMinutes(start.getUTCMinutes() + minutes);
  return start.toISOString().slice(0, 19);
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    if (!calendarId) {
      throw new Error("Missing OUTLOOK_CALENDAR_ID env var");
    }

    const accessToken = await getAppOnlyAccessToken();
    const body = await parseBody(req);
    const {
      date,
      time,
      durationMinutes = 60,
      serviceId,
      serviceTitle,
      clientName,
      clientEmail,
      notes,
      timeZone = "UTC",
    } = body;

    if (!date || !time) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Missing date or time" }));
      return;
    }

    const startDateTime = `${date}T${time}:00`;
    const endDateTime = addMinutesToDateTime(date, time, durationMinutes);

    const subject = serviceTitle || `Training booking (${serviceId || "custom"})`;
    const description =
      notes || `Client: ${clientName || "Unknown"}\nService: ${serviceTitle || serviceId}`;

    const event = await createEvent({
      accessToken,
      calendarId,
      subject,
      body: description,
      start: startDateTime,
      end: endDateTime,
      attendeeEmail: clientEmail,
      timeZone,
    });

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        id: event.id,
        webLink: event.webLink,
        subject,
        start: event.start,
        end: event.end,
      })
    );
  } catch (error) {
    console.error("Booking error", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Failed to book event" }));
  }
};