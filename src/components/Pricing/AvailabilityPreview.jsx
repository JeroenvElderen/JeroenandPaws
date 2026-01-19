import { DateTime } from "luxon";
import React, { useEffect, useMemo, useState } from "react";
import { getCachedAvailability, prefetchAvailability } from "./availabilityCache";

const DEFAULT_TIME_ZONE = "Europe/Dublin";
const MIN_LEAD_MINUTES = 30;

const buildPreviewSlots = (availability, limit = 3) => {
  if (!availability?.dates?.length) return [];
  const timeZone = availability.timeZone || DEFAULT_TIME_ZONE;
  const slots = [];
  const cutoffTime = DateTime.now()
    .setZone(timeZone)
    .plus({ minutes: MIN_LEAD_MINUTES });

  for (const day of availability.dates) {
    if (!day?.slots?.length) continue;
    for (const slot of day.slots) {
      if (!slot?.available) continue;
      const dateTime = DateTime.fromISO(`${day.date}T${slot.time}`, {
        zone: timeZone,
      });
      if (!dateTime.isValid || dateTime < cutoffTime) continue;
      slots.push({
        key: `${day.date}-${slot.time}`,
        dateLabel: dateTime.toFormat("EEE d LLL"),
        timeLabel: dateTime.toFormat("HH:mm"),
      });
      if (slots.length >= limit) return slots;
    }
  }

  return slots;
};

const AvailabilityPreview = ({ service, limit = 3 }) => {
  const serviceId = service?.id || null;
  const durationMinutes = Number.isFinite(service?.durationMinutes)
    ? service.durationMinutes
    : 60;
  const initialAvailability = serviceId ? getCachedAvailability(serviceId) : null;
  const [availability, setAvailability] = useState(initialAvailability);
  const [status, setStatus] = useState(() => {
    if (!serviceId) return "hidden";
    return initialAvailability ? "ready" : "loading";
  });

  useEffect(() => {
    if (!serviceId) {
      setAvailability(null);
      setStatus("hidden");
      return;
    }

    let isMounted = true;
    const cached = getCachedAvailability(serviceId);

    setAvailability(cached || null);
    setStatus(cached ? "ready" : "loading");

    prefetchAvailability({ id: serviceId, durationMinutes })
      .then((data) => {
        if (!isMounted) return;
        setAvailability(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [serviceId, durationMinutes]);

  const previewSlots = useMemo(
    () => buildPreviewSlots(availability, limit),
    [availability, limit]
  );

  if (status === "hidden") return null;

  return (
    <div className="availability-preview">
      <span className="eyebrow">Next openings</span>
      {status === "loading" && <p className="muted">Loading openings…</p>}
      {status === "error" && (
        <p className="muted">Live availability loads once you open the calendar.</p>
      )}
      {status === "ready" && previewSlots.length === 0 && (
        <p className="muted">No open slots show up in the current window.</p>
      )}
      {status === "ready" && previewSlots.length > 0 && (
        <ul className="availability-slots">
          {previewSlots.map((slot) => (
            <li key={slot.key} className="availability-slot">
              <span>{slot.dateLabel}</span>
              <time>{slot.timeLabel}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AvailabilityPreview;