const { getAppOnlyAccessToken } = require("./_lib/auth");
const { getSchedule } = require("./_lib/graph");

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

    const accessToken = await getAppOnlyAccessToken();
    const availability = await getSchedule({
      accessToken,
      calendarId,
      windowDays: 21,
    });

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(availability));
  } catch (error) {
    console.error("Availability error", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json"); // ← critical fix
    res.end(JSON.stringify({ message: "Failed to fetch availability" }));
  }
};
