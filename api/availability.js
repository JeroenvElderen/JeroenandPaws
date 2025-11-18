const { ensureTokens, parseTokens } = require("./_lib/auth");
const { getSchedule } = require("./_lib/graph");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
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

    const availability = await getSchedule({
      accessToken: tokens.accessToken,
      calendarId: process.env.OUTLOOK_CALENDAR_ID,
    });

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(availability));
  } catch (error) {
    console.error("Availability error", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Failed to fetch availability" }));
  }
};