const BUSINESS_TIME_ZONE = "Europe/Dublin";

export const buildMonthMatrix = (visibleDate) => {
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = new Date(firstOfMonth);
    day.setDate(index + 1);
    return day;
  });
};

const generateRandomSlots = (date, durationMinutes) => {
  if (durationMinutes) {
    return Array.from({ length: 5 }, (_, i) => {
      const hour = 9 + i * 2;
      const formattedHour = hour.toString().padStart(2, "0");
      const endHour = hour + durationMinutes / 60;
      const formattedEndHour = endHour.toString().padStart(2, "0");
      const formattedDate = `${date}T${formattedHour}:00:00`;
      const slotDate = new Date(formattedDate);
      const time = `${slotDate
        .toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: BUSINESS_TIME_ZONE }
        )
        .padStart(5, "0")}`;

      const endTime = `${formattedEndHour.padStart(2, "0")}:${slotDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      return {
        time,
        endTime,
        available: Math.random() > 0.2,
        iso: `${date}T${time}:00`,
      };
    });
  }

  return Array.from({ length: 8 }, (_, i) => {
    const hour = 8 + i * 2;
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedDate = `${date}T${formattedHour}:00:00`;
    const slotDate = new Date(formattedDate);
    const time = `${slotDate
      .toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: BUSINESS_TIME_ZONE }
      )
      .padStart(5, "0")}`;

    return {
      time,
      available: Math.random() > 0.2,
      iso: `${date}T${time}:00`,
    };
  });
};

export const generateDemoAvailability = (durationMinutes) => {
  const today = new Date();
  const timeZone = BUSINESS_TIME_ZONE;
  const dates = Array.from({ length: 42 }, (_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() + index);
    const isoDate = d.toISOString().split("T")[0];

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    if (isWeekend) {
      return { date: isoDate, slots: [] };
    }

    const slots = generateRandomSlots(isoDate, durationMinutes);
    return { date: isoDate, slots };
  });

  return { timeZone, dates };
};

export const createEmptyDogProfile = () => ({
  name: "",
  breed: "",
  notes: "",
  photoDataUrl: "",
  photoName: "",
  profileId: null,
});

const RESUME_TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateResumeToken = (segments = 2, segmentLength = 4) => {
  const totalLength = Math.max(1, segments) * Math.max(1, segmentLength);
  const randomValues = Array.from({ length: totalLength }, () =>
    RESUME_TOKEN_ALPHABET.charAt(
      Math.floor(Math.random() * RESUME_TOKEN_ALPHABET.length)
    )
  );

  const chunks = [];
  for (let i = 0; i < randomValues.length; i += segmentLength) {
    chunks.push(randomValues.slice(i, i + segmentLength).join(""));
  }

  return chunks.join("-");
};