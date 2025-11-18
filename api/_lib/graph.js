const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const mapBusyIntervals = (items) =>
  items.map((item) => ({
    start: new Date(item.start.dateTime),
    end: new Date(item.end.dateTime),
  }));

const overlaps = (start, end, busy) => {
  return busy.some((interval) => start < interval.end && end > interval.start);
};

const buildSlots = (startDate, days, intervalMinutes, busy) => {
  const slotsByDate = {};
  const workingDayStart = 9;
  const workingDayEnd = 17;

  for (let i = 0; i < days; i += 1) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const currentDate = date.toISOString().slice(0, 10);
    slotsByDate[currentDate] = [];

    for (let hour = workingDayStart; hour <= workingDayEnd; hour += 1) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const slotStart = new Date(date);
        slotStart.setUTCHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + intervalMinutes);
        const time = slotStart.toISOString().slice(11, 16);

        const available = !overlaps(slotStart, slotEnd, busy);
        slotsByDate[currentDate].push({ time, available });
      }
    }
  }

  return slotsByDate;
};

const getSchedule = async ({ accessToken, calendarId, windowDays = 7 }) => {
  const startTime = new Date();
  const endTime = new Date();
  endTime.setDate(startTime.getDate() + windowDays);

  const response = await fetch(`${GRAPH_BASE}/me/calendar/getSchedule`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      schedules: [calendarId || "me"],
      startTime: { dateTime: startTime.toISOString(), timeZone: "UTC" },
      endTime: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      availabilityViewInterval: 30,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Graph schedule error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const schedule = data.value?.[0];
  const timeZone = schedule?.workingHours?.timeZone?.name || "UTC";
  const busy = mapBusyIntervals(schedule?.scheduleItems || []);
  const slotsByDate = buildSlots(startTime, windowDays, 30, busy);

  const dates = Object.keys(slotsByDate).map((date) => ({
    date,
    slots: slotsByDate[date],
  }));

  return { timeZone, dates };
};

const createEvent = async ({
  accessToken,
  subject,
  body,
  start,
  end,
  attendeeEmail,
  timeZone = "UTC",
}) => {
  const response = await fetch(`${GRAPH_BASE}/me/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject,
      body: {
        contentType: "Text",
        content: body,
      },
      start: { dateTime: start, timeZone },
      end: { dateTime: end, timeZone },
      attendees: attendeeEmail
        ? [
            {
              emailAddress: { address: attendeeEmail },
              type: "required",
            },
          ]
        : [],
      isReminderOn: true,
      reminderMinutesBeforeStart: 15,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Graph create event error: ${response.status} ${error}`);
  }

  return response.json();
};

module.exports = { createEvent, getSchedule };