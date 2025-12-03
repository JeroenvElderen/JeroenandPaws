import { useState, useCallback, useMemo } from "react";

export function useBookingCalendar(service, availability, isDayAvailableForService) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedTime, setSelectedTime] = useState("");

  const availabilityMap = useMemo(() => {
    return (availability?.dates || []).reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {});
  }, [availability]);

  const getDefaultSlotForDate = useCallback(
    (iso) => {
      const day = availabilityMap[iso];
      if (!day) return "";
      const first = day.slots.find((s) => s.available);
      return first?.time || "";
    },
    [availabilityMap]
  );

  const formatTime = (slot) => {
    const [h, m] = slot.split(":");
    return `${h}:${m}`;
  };

  const scheduleEntries = useMemo(() => {
    return Object.entries(selectedSlots)
      .map(([date, time]) => ({ date, time }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedSlots]);

  return {
    selectedDate, setSelectedDate,
    selectedSlots, setSelectedSlots,
    selectedTime, setSelectedTime,
    getDefaultSlotForDate,
    formatTime,
    availabilityMap,
    scheduleEntries,
  };
}
