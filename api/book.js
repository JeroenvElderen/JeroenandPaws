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
      dogs = [],
      dogCount,
    } = body;

    if (!date || !time) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Missing date or time" }));
      return;
    }

    const startDateTime = `${date}T${time}:00`;
    const endDateTime = addMinutesToDateTime(date, time, durationMinutes);

    const subject = serviceTitle || `Training booking (${serviceId || "custom"})`;
    const formattedDogs = Array.isArray(dogs) && dogs.length
      ? dogs
          .map((dog, index) => {
            const name = dog?.name || "Name pending";
            const breed = dog?.breed || "Breed pending";
            const photoName = dog?.photoName;
            const photoDataUrl = dog?.photoDataUrl;
            const photoLine = photoDataUrl
              ? `Photo: ${photoName || "Uploaded"} (${photoDataUrl.slice(0, 80)}...)`
              : "Photo: none";
            return `Dog ${index + 1}: ${name} (${breed}) | ${photoLine}`;
          })
          .join("\n")
      : "Dog details pending";

    const description = [
      `Client: ${clientName || "Unknown"}`,
      `Email: ${clientEmail || "n/a"}`,
      `Service: ${serviceTitle || serviceId}`,
      `Dogs: ${dogCount ?? dogs.length ?? 0}`,
      formattedDogs,
      `Notes: ${notes || "None"}`,
    ].join("\n");

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