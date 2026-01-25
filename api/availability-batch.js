const availabilityHandler = require("./availability");
const { getAppOnlyAccessToken } = require("./_lib/auth");

const parseServicesParam = (servicesParam) => {
  if (!servicesParam) return [];
  try {
    const parsed = JSON.parse(servicesParam);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((service) => ({
        id: service?.id ? String(service.id) : "",
        durationMinutes: Number.parseInt(service?.durationMinutes, 10),
      }))
      .filter((service) => service.id);
  } catch (error) {
    return [];
  }
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

    const { services: servicesParam, clientAddress, windowDays: windowDaysParam } =
      req.query || {};
    const services = parseServicesParam(servicesParam);

    if (!services.length) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ message: "Provide at least one service to batch." })
      );
      return;
    }

    const accessToken = await getAppOnlyAccessToken();
    const windowDays = availabilityHandler.resolveWindowDays(windowDaysParam);
    const { startTime, endTime } = availabilityHandler.buildTimeWindow(
      windowDays
    );
    const events = await availabilityHandler.fetchCalendarEventsSafe({
      accessToken,
      calendarId,
      startTime,
      endTime,
    });

    const results = await Promise.all(
      services.map(async (service) => {
        try {
          const availability = await availabilityHandler.buildAvailability({
            accessToken,
            calendarId,
            windowDays,
            durationMinutes: Number.isNaN(service.durationMinutes)
              ? undefined
              : service.durationMinutes,
            clientAddress,
            events,
          });
          return { id: service.id, availability };
        } catch (error) {
          return {
            id: service.id,
            error: error?.message || "Failed to fetch availability",
          };
        }
      })
    );

    const availability = {};
    const errors = {};
    results.forEach((result) => {
      if (result.availability) {
        availability[result.id] = result.availability;
      } else if (result.error) {
        errors[result.id] = result.error;
      }
    });

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ availability, errors }));
  } catch (error) {
    console.error("Availability batch error", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Failed to fetch availability batch" }));
  }
};