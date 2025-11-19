export const buildMonthMatrix = (visibleDate) => {
  const firstOfMonth = new Date(
    visibleDate.getFullYear(),
    visibleDate.getMonth(),
    1
  );
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const firstVisible = new Date(firstOfMonth);
  firstVisible.setDate(firstOfMonth.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisible);
    day.setDate(firstVisible.getDate() + index);
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
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
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
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
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
  const timeZone = "GMT Standard Time";
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
  photoDataUrl: "",
  photoName: "",
});