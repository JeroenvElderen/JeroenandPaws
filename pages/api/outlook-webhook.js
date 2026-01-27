const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { createSubscription, renewSubscription } = require("./_lib/graph");

const buildExpiration = () =>
  DateTime.now().plus({ hours: 48 }).toUTC().toISO();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    const notificationUrl = process.env.OUTLOOK_WEBHOOK_URL;
    const clientState = process.env.OUTLOOK_WEBHOOK_CLIENT_STATE || undefined;

    if (!calendarId || !notificationUrl) {
      res.statusCode = 400;
      res.end("Missing OUTLOOK_CALENDAR_ID or OUTLOOK_WEBHOOK_URL");
      return;
    }

    const accessToken = await getAppOnlyAccessToken();
    const { subscriptionId } = req.body || {};

    if (subscriptionId) {
      const renewed = await renewSubscription({
        accessToken,
        subscriptionId,
        expirationDateTime: buildExpiration(),
      });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ subscription: renewed, action: "renewed" }));
      return;
    }

    const subscription = await createSubscription({
      accessToken,
      calendarId,
      notificationUrl,
      clientState,
      expirationDateTime: buildExpiration(),
    });

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ subscription, action: "created" }));
  } catch (error) {
    console.error("Outlook subscription error", error);
    res.statusCode = 500;
    res.end("Failed to create subscription");
  }
};