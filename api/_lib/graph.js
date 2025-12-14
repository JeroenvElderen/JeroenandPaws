const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const MAX_GRAPH_WINDOW_DAYS = 62;

const BUSINESS_TIME_ZONE = "Europe/Dublin";

const mapBusyIntervals = (items) =>
  items.map((item) => ({
    start: new Date(item.start.dateTime),
    end: new Date(item.end.dateTime),
  }));

const overlaps = (start, end, busy) => {
  return busy.some((interval) => start < interval.end && end > interval.start);
};

const buildSlots = (
  startDate,
  days,
  intervalMinutes,
  busy,
  serviceDurationMinutes
) => {
  const slotsByDate = {};
  const workingDayStart = 9;
  const workingDayEnd = 17;
  const durationMinutes = Number.isFinite(serviceDurationMinutes)
    ? serviceDurationMinutes
    : intervalMinutes;

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
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
        const workingEndBoundary = new Date(date);
        workingEndBoundary.setUTCHours(workingDayEnd, 0, 0, 0);
        const withinWorkingDay = slotEnd <= workingEndBoundary;
        const time = slotStart.toISOString().slice(11, 16);

        const available =
          withinWorkingDay && !overlaps(slotStart, slotEnd, busy);
        slotsByDate[currentDate].push({ time, available });
      }
    }
  }

  return slotsByDate;
};

const buildPrincipalPath = (calendarId) =>
  calendarId ? `/users/${encodeURIComponent(calendarId)}` : "/me";

const listCalendarEvents = async ({ accessToken, calendarId, start, end }) => {
  const principalPath = buildPrincipalPath(calendarId);
  const startDate = new Date(start);
  const endDate = new Date(end);

  const response = await fetch(
    `${GRAPH_BASE}${principalPath}/calendarView?startDateTime=${encodeURIComponent(
      startDate.toISOString()
    )}&endDateTime=${encodeURIComponent(endDate.toISOString())}` +
      "&$select=id,subject,start,end,location,bodyPreview,showAs,isCancelled",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: `outlook.timezone=\"${BUSINESS_TIME_ZONE}\"`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Graph calendar events error: ${response.status} ${error}`
    );
  }

  const data = await response.json();
  return data.value || [];
};

const postScheduleRequest = async ({
  accessToken,
  calendarId,
  startTime,
  endTime,
}) => {
  const principalPath = buildPrincipalPath(calendarId);

  const response = await fetch(
    `${GRAPH_BASE}${principalPath}/calendar/getSchedule`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schedules: [calendarId || "me"],
        startTime: {
          dateTime: startTime.toISOString(),
          timeZone: BUSINESS_TIME_ZONE,
        },
        endTime: { dateTime: endTime.toISOString(), timeZone: BUSINESS_TIME_ZONE },
        availabilityViewInterval: 30,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Graph schedule error: ${response.status} ${error}`);
  }

  return response.json();
};

const getSchedule = async ({
  accessToken,
  calendarId,
  windowDays = 7,
  serviceDurationMinutes,
}) => {
  const totalDays = Math.max(windowDays, 1);
  const startTime = new Date();
  const busy = [];
  const timeZone = BUSINESS_TIME_ZONE;

  for (let offset = 0; offset < totalDays; offset += MAX_GRAPH_WINDOW_DAYS) {
    const chunkStart = new Date(startTime);
    chunkStart.setDate(chunkStart.getDate() + offset);

    const chunkDays = Math.min(MAX_GRAPH_WINDOW_DAYS, totalDays - offset);
    const chunkEnd = new Date(chunkStart);
    chunkEnd.setDate(chunkEnd.getDate() + chunkDays);

    const data = await postScheduleRequest({
      accessToken,
      calendarId,
      startTime: chunkStart,
      endTime: chunkEnd,
    });

    const schedule = data.value?.[0];

    busy.push(...mapBusyIntervals(schedule?.scheduleItems || []));
  }

  const slotsByDate = buildSlots(
    startTime,
    totalDays,
    30,
    busy,
    serviceDurationMinutes
  );

  const dates = Object.keys(slotsByDate).map((date) => ({
    date,
    slots: slotsByDate[date],
  }));

  return { timeZone, dates };
};

const createEvent = async ({
  accessToken,
  calendarId,
  subject,
  body,
  start,
  bodyContentType = "Text",
  end,
  attendeeEmail,
  attendeeEmails = [],
  timeZone = BUSINESS_TIME_ZONE,
  locationDisplayName,
}) => {
  const principalPath = buildPrincipalPath(calendarId);

  const attendees = [
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
    attendeeEmail,
  ]
    .filter(Boolean)
    .map((address) => address.trim())
    .filter(Boolean)
    .reduce((list, address) => {
      const key = address.toLowerCase();
      if (
        list.some(
          (attendee) => attendee.emailAddress.address.toLowerCase() === key
        )
      ) {
        return list;
      }
      return [
        ...list,
        {
          emailAddress: { address },
          type: "required",
        },
      ];
    }, []);

  const response = await fetch(`${GRAPH_BASE}${principalPath}/events`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    subject,
    body: {
      contentType: bodyContentType,
      content: body,
    },
    start: { dateTime: start, timeZone },
    end: { dateTime: end, timeZone },
    attendees,
    isReminderOn: true,
    reminderMinutesBeforeStart: 60,
    ...(locationDisplayName
      ? { location: { displayName: locationDisplayName } }
      : {}),
  }),
});

  if (!response.ok) {
  const text = await response.text();
  console.error("GRAPH EVENT ERROR:", {
    status: response.status,
    body: text
  });
  throw new Error(`Graph create event error: ${response.status} ${text}`);
}

  return response.json();
};

const getEvent = async ({ accessToken, calendarId, eventId }) => {
  if (!accessToken || !eventId) return { exists: false };

  const principalPath = buildPrincipalPath(calendarId);

  const response = await fetch(
    `${GRAPH_BASE}${principalPath}/events/${encodeURIComponent(eventId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 404) {
    return { exists: false, missing: true };
  }

  if (!response.ok) {
    const text = await response.text();
    console.error('GRAPH EVENT FETCH ERROR:', {
      status: response.status,
      body: text,
    });
    throw new Error(`Graph get event error: ${response.status} ${text}`);
  }

  return { exists: true, event: await response.json() };
};

const deleteEvent = async ({ accessToken, calendarId, eventId }) => {
  if (!accessToken || !eventId) return { skipped: true };

  const principalPath = buildPrincipalPath(calendarId);

  const response = await fetch(
    `${GRAPH_BASE}${principalPath}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 404) {
    return { deleted: false, missing: true };
  }

  if (!response.ok) {
    const text = await response.text();
    console.error("GRAPH EVENT DELETE ERROR:", {
      status: response.status,
      body: text,
    });
    throw new Error(`Graph delete event error: ${response.status} ${text}`);
  }

  return { deleted: true };
};

const sendMail = async ({
  accessToken,
  fromCalendarId,
  to,
  subject,
  body,
  contentType = "HTML",
  from,
  replyTo,
}) => {
  if (!to) {
    throw new Error("sendMail called without recipient email address");
  }

  const recipients = Array.isArray(to)
    ? to.filter(Boolean).map((address) => ({
        emailAddress: { address },
      }))
    : [
        {
          emailAddress: {
            address: to,
          },
        },
      ];

  const replyToEntries = Array.isArray(replyTo)
    ? replyTo.filter(Boolean).map((address) => ({
        emailAddress: { address },
      }))
    : replyTo
    ? [{ emailAdDress: { address: replyTo } }]
    : undefined;

  const principalPath = buildPrincipalPath(fromCalendarId);

  const response = await fetch(`${GRAPH_BASE}${principalPath}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        ...(from ? { from: { emailAddress: { address: from } } } : {}),
        subject,
        body: {
          contentType,
          content: body,
        },
        toRecipients: recipients,
        ...(replyToEntries ? { replyTo: replyToEntries } : {}),
      },
      saveToSentItems: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    const recipientList = recipients
      .map((recipient) => recipient.emailAddress.address)
      .join(", ");
    throw new Error(
      `Graph send mail error: ${response.status} recipients=[${recipientList}] ${error}`
    );
  }
};

module.exports = {
  createEvent,
  deleteEvent,
  getEvent,
  getSchedule,
  listCalendarEvents,
  sendMail,
};