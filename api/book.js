const { ensureTokens, parseTokens } = require("./_lib/auth");
const { createEvent } = require("./_lib/graph");

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const tokens = (await ensureTokens(req, res)) || parseTokens(req);
    if (!tokens?.accessToken) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ message: "Unauthorized", loginUrl: "/api/auth/microsoft/login" })
      );
      return;
    }

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

    const start = new Date(`${date}T${time}:00Z`);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);

    const subject = serviceTitle || `Training booking (${serviceId || "custom"})`;
    const description =
      notes || `Client: ${clientName || "Unknown"}\nService: ${serviceTitle || serviceId}`;

    const event = await createEvent({
      accessToken: tokens.accessToken,
      subject,
      body: description,
      start: start.toISOString(),
      end: end.toISOString(),
      attendeeEmail: clientEmail,
      timeZone,
    });

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: event.id, webLink: event.webLink }));
  } catch (error) {
    console.error("Booking error", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Failed to book event" }));
  }
};