const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { getCalendarEvents, getSchedule } = require("./_lib/graph");
const {
  DEFAULT_HOME_ADDRESS,
  DEFAULT_MIN_TRAVEL_MINUTES,
  estimateTravelMinutes,
} = require("./_lib/travel");

const EIRCODE_FULL_REGEX = /\b([AC-FHKNPRTV-Y]\d{2}[AC-FHKNPRTV-Y0-9]{4})\b/i;
const EIRCODE_ROUTING_REGEX = /\b([AC-FHKNPRTV-Y]\d{2})\b/i;

const extractEircode = (location = "") => {
  const trimmed = (location || "").toUpperCase();
  if (!trimmed) return "";
  const fullMatch = trimmed.match(EIRCODE_FULL_REGEX);
  if (fullMatch) return fullMatch[1];
  const routingMatch = trimmed.match(EIRCODE_ROUTING_REGEX);
  return routingMatch ? routingMatch[1] : "";
};

const buildBufferedBusyByDate = (busy = [], bufferMinutes, timeZone) => {
  if (!Array.isArray(busy) || busy.length === 0 || bufferMinutes <= 0) {
    return {};
  }

  return busy.reduce((acc, interval) => {
    if (!interval?.start || !interval?.end) return acc;

    const start = DateTime.fromISO(interval.start).setZone(timeZone);
    const end = DateTime.fromISO(interval.end).setZone(timeZone);

    if (!start.isValid || !end.isValid) return acc;

    const bufferedStart = start.minus({ minutes: bufferMinutes });
    const bufferedEnd = end.plus({ minutes: bufferMinutes });

    const startDateKey = bufferedStart.toISODate();
    const endDateKey = bufferedEnd.toISODate();

    const pushInterval = (dateKey, range) => {
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(range);
    };

    if (startDateKey === endDateKey) {
      pushInterval(startDateKey, {
        startMinutes: bufferedStart.hour * 60 + bufferedStart.minute,
        endMinutes: bufferedEnd.hour * 60 + bufferedEnd.minute,
      });
      return acc;
    }

    pushInterval(startDateKey, {
      startMinutes: bufferedStart.hour * 60 + bufferedStart.minute,
      endMinutes: 24 * 60,
    });
    pushInterval(endDateKey, {
      startMinutes: 0,
      endMinutes: bufferedEnd.hour * 60 + bufferedEnd.minute,
    });

    return acc;
  }, {});
};

const normalizeCalendarEvents = (events, timeZone) =>
  (events || [])
    .map((event) => {
      if (!event?.start?.dateTime || !event?.end?.dateTime) return null;
      const startZone = event.start.timeZone || timeZone;
      const endZone = event.end.timeZone || timeZone;
      const start = DateTime.fromISO(event.start.dateTime, {
        zone: startZone,
      }).toUTC();
      const end = DateTime.fromISO(event.end.dateTime, {
        zone: endZone,
      }).toUTC();

      if (!start.isValid || !end.isValid) return null;

      return {
        start,
        end,
        location:
          extractEircode(event.location?.displayName || "") ||
          event.location?.displayName ||
          "",
        showAs: event.showAs,
        isCancelled: event.isCancelled,
      };
    })
    .filter(
      (event) =>
        event &&
        !event.isCancelled &&
        event.showAs?.toLowerCase() !== "free"
    )
    .sort((a, b) => a.start.toMillis() - b.start.toMillis());

const findAdjacentEvents = (events, slotStartUtc, slotEndUtc) => {
  let previous = null;
  let next = null;

  for (const event of events) {
    if (event.end <= slotStartUtc) {
      if (!previous || event.end > previous.end) {
        previous = event;
      }
    }
    if (event.start >= slotEndUtc) {
      if (!next || event.start < next.start) {
        next = event;
      }
    }
  }

  return { previous, next };
};

const applyTravelBufferToAvailability = async ({
  availability,
  clientAddress,
  durationMinutes,
  events,
}) => {
  const trimmedAddress = (clientAddress || "").trim();
  if (!trimmedAddress) return availability;

  const dates = availability?.dates || [];
  if (!dates.length) return availability;

  const timeZone = availability.timeZone || "Europe/Dublin";
  const baseAddress =
    process.env.TRAVEL_HOME_ADDRESS ||
    process.env.HOME_BASE_ADDRESS ||
    DEFAULT_HOME_ADDRESS;

  const busyWindows = availability?.busy || [];
  const normalizedEvents = normalizeCalendarEvents(events, timeZone);
  const eventLocations = normalizedEvents
    .map((event) => event.location)
    .filter(Boolean);
  const bufferMinutes = busyWindows.length
    ? Math.max(
        DEFAULT_MIN_TRAVEL_MINUTES,
        await estimateTravelMinutes(baseAddress, trimmedAddress)
      )
    : 0;
  const bufferedBusyByDate = buildBufferedBusyByDate(
    busyWindows,
    bufferMinutes,
    timeZone
  );
  const hasBufferedBusy = Object.keys(bufferedBusyByDate).length > 0;
  const hasEventLocations = eventLocations.length > 0;

  if (!hasBufferedBusy && !hasEventLocations) {
    return availability;
  }

  const slotDuration = Number.isFinite(durationMinutes)
    ? durationMinutes
    : 60;
  const travelCache = new Map();

  const getTravelMinutes = async (fromAddress, toAddress) => {
    const from = (fromAddress || "").trim();
    const to = (toAddress || "").trim();
    const cacheKey = `${from.toLowerCase()}|${to.toLowerCase()}`;
    if (travelCache.has(cacheKey)) {
      return travelCache.get(cacheKey);
    }
    const minutes = await estimateTravelMinutes(
      from || baseAddress,
      to || baseAddress
    );
    travelCache.set(cacheKey, minutes);
    return minutes;
  };

  const updatedDates = [];

  for (const day of dates) {
    const updatedSlots = [];
    for (const slot of day.slots || []) {
      if (!slot.available) {
        updatedSlots.push(slot);
        continue;
      }

      const slotStart = DateTime.fromISO(`${day.date}T${slot.time}`, {
        zone: timeZone,
      });
      const slotEnd = slotStart.plus({ minutes: slotDuration });

      const startMinutes = slotStart.hour * 60 + slotStart.minute;
      const endMinutes = startMinutes + slotDuration;
      const bufferedBusy = bufferedBusyByDate[day.date] || [];
      const conflictsWithBufferedBusy = bufferedBusy.some(
        ({ startMinutes: busyStart, endMinutes: busyEnd }) =>
          endMinutes > busyStart && startMinutes < busyEnd
      );

      if (conflictsWithBufferedBusy) {
        updatedSlots.push({ ...slot, available: false, reachable: false });
        continue;
      }

      if (normalizedEvents.length) {
        const slotStartUtc = slotStart.toUTC();
        const slotEndUtc = slotEnd.toUTC();
        const { previous, next } = findAdjacentEvents(
          normalizedEvents,
          slotStartUtc,
          slotEndUtc
        );

        if (previous) {
          const availableGap = slotStartUtc
            .diff(previous.end, "minutes")
            .as("minutes");
          const travelMinutes = await getTravelMinutes(
            previous.location || baseAddress,
            trimmedAddress
          );
          if (availableGap < travelMinutes) {
            updatedSlots.push({ ...slot, available: false, reachable: false });
            continue;
          }
        }

        if (next) {
          const availableGap = next.start
            .diff(slotEndUtc, "minutes")
            .as("minutes");
          const travelMinutes = await getTravelMinutes(
            trimmedAddress,
            next.location || baseAddress
          );
          if (availableGap < travelMinutes) {
            updatedSlots.push({ ...slot, available: false, reachable: false });
            continue;
          }
        }
      }

      updatedSlots.push(slot);
    }

    updatedDates.push({ ...day, slots: updatedSlots });
  }

  return { ...availability, dates: updatedDates };
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

    const { durationMinutes, clientAddress } = req.query || {};
    const serviceDurationMinutes = Number.parseInt(durationMinutes, 10);

    const accessToken = await getAppOnlyAccessToken();
    const windowDays = Number.parseInt(
      process.env.WINDOW_DAYS ?? "365",
      10
    );

    const startTime = DateTime.now().setZone("Europe/Dublin");
    const endTime = startTime.plus({
      days: Number.isNaN(windowDays) ? 21 : Math.max(windowDays, 1),
    });

    let availability = await getSchedule({
      accessToken,
      calendarId,
      windowDays: Number.isNaN(windowDays) ? 21 : Math.max(windowDays, 1),
      serviceDurationMinutes: Number.isNaN(serviceDurationMinutes)
        ? undefined
        : serviceDurationMinutes,
    });

    const events = await getCalendarEvents({
      accessToken,
      calendarId,
      startTime,
      endTime,
    });

    availability = await applyTravelBufferToAvailability({
      availability,
      clientAddress,
      durationMinutes: Number.isNaN(serviceDurationMinutes)
        ? undefined
        : serviceDurationMinutes,
      events,
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
