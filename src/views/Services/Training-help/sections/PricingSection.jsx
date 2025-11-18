import React, { useState, useMemo, useEffect, useCallback } from "react";

const services = [
  {
    id: "quick-sniff",
    title: "Quick Sniff & Stroll",
    label: "30-Min Walks",
    price: "€7/walk",
    description:
      "Perfect for potty breaks, puppy zoomies, or a little leg stretch between naps.",
    duration: "30 Min Meeting",
  },
  {
    id: "daily-doggie",
    title: "Daily Doggie Adventure",
    label: "60-Min Walks",
    price: "€12/walk",
    description:
      "An hour of tail wags, sniffing every tree, and coming home happily tired.",
    duration: "60 Min Session",
  },
  {
    id: "mega-adventure",
    title: "Mega Adventure Walk",
    label: "120-min walks",
    price: "€22/walk",
    description:
      "Double the time, double the fun — great for big explorers or extra energy days.",
    duration: "2 Hour Adventure",
  },
  {
    id: "custom-walk",
    title: "Your Walk, Your Way",
    label: "Custom walk",
    price: "Tailored",
    description:
      "Need a special route or timing? Let’s make it paw-fect for your pup.",
    duration: "Custom Plan",
  },
];

const BookingModal = ({ service, onClose }) => {
  const [is24h, setIs24h] = useState(true);
  const [availability, setAvailability] = useState({
    dates: [],
    timeZone: "UTC",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const apiBaseUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "").replace(/\/$/, ""),
    []
  );

  const parseJsonSafely = useCallback(async (response, requestUrl) => {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    const trimmed = text.trim();

    if (!response.ok) {
      const fallbackMessage = `Unable to load availability (${response.status})`;
      const message = trimmed && !trimmed.startsWith("<") ? trimmed : fallbackMessage;
      throw new Error(message);
    }

    const looksLikeJson =
      contentType.includes("application/json") ||
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed === "";
    
    if (!looksLikeJson) {
      throw new Error(
       `Received an unexpected response while loading availability. Please try again or use the contact form (source: ${requestUrl}).`
      );
    }

    try {
      return trimmed ? JSON.parse(trimmed) : {};
    } catch (parseError) {
      throw new Error(
        "Availability response could not be read. Please refresh and try again."
      );
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const requestUrl = `${apiBaseUrl}/api/availability?serviceId=${service.id}`;
      const response = await fetch(requestUrl, {
        headers: { Accept: "application/json" },
      });
      if (response.status === 401) {
        window.location.href = "/api/auth/microsoft/login";
        return;
      }

      const data = await parseJsonSafely(response, requestUrl);
      setAvailability(data);

      const firstOpenDate = data.dates.find((day) =>
        day.slots.some((slot) => slot.available)
      );
      if (firstOpenDate) {
        setSelectedDate(firstOpenDate.date);
        const firstSlot = firstOpenDate.slots.find((slot) => slot.available);
        setSelectedTime(firstSlot?.time || "");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [parseJsonSafely, service.id]);
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const calendarDays = useMemo(() => availability.dates || [], [availability]);

  const formatTime = (slot) => {
    if (is24h) return slot;
    const [hourStr, minutes] = slot.split(":");
    const hour = Number(hourStr);
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}:${minutes} ${suffix}`;
  };

  const selectedDay = calendarDays.find((day) => day.date === selectedDate);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please pick a date and time.");
      return;
    }
    setIsBooking(true);
    setError("");
    setSuccess("");
    try {
      const requestUrl = `${apiBaseUrl}/api/book`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          serviceId: service.id,
          serviceTitle: service.title,
          clientName,
          clientEmail,
          notes,
          timeZone: availability.timeZone,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/api/auth/microsoft/login";
        return;
      }
      if (!response.ok) {
        throw new Error("Booking failed. Please try again.");
      }
      setSuccess("Session booked! Check your Outlook calendar for details.");
    } catch (bookingError) {
      setError(bookingError.message);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="booking-modal">
        <header className="booking-header">
          <div>
            <p className="eyebrow">{service.duration}</p>
            <h3>{service.title}</h3>
            <p className="muted">Jeroen van Elderen · Jeroen & Paws</p>
          </div>
          <button
            className="close-button"
            type="button"
            onClick={onClose}
            aria-label="Close booking"
          >
            ×
          </button>
        </header>

        <div className="booking-body">
          <div className="calendar-card">
            <div className="calendar-header">
              <div>
                <p className="muted">{availability.timeZone}</p>
                <h4>Pick a date</h4>
              </div>
              <div
                className="toggle-group"
                role="group"
                aria-label="Time display format"
              >
                <button
                  type="button"
                  className={`pill ${is24h ? "active" : ""}`}
                  onClick={() => setIs24h(true)}
                >
                  24h
                </button>
                <button
                  type="button"
                  className={`pill ${!is24h ? "active" : ""}`}
                  onClick={() => setIs24h(false)}
                >
                  12h
                </button>
              </div>
            </div>
            {loading ? (
              <p className="muted">Loading availability…</p>
            ) : (
              <div className="calendar-grid" aria-label="Calendar">
                {calendarDays.length === 0 && (
                  <p className="muted">No free dates returned.</p>
                )}
                {calendarDays.map((day) => {
                  const dateObj = new Date(day.date);
                  const label = dateObj.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  });
                  const isSelected = day.date === selectedDate;
                  const hasOpenSlot = day.slots.some((slot) => slot.available);
                  return (
                    <button
                      key={day.date}
                      type="button"
                      className={`day ${isSelected ? "selected" : ""} ${
                        hasOpenSlot ? "" : "muted"
                      }`}
                      onClick={() => setSelectedDate(day.date)}
                      aria-pressed={isSelected}
                      disabled={!hasOpenSlot}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            {error && <p className="error-banner">{error}</p>}
            {success && <p className="success-banner">{success}</p>}
          </div>

          <div className="times-card">
            <div className="times-header">
              <span className="pill ghost">
                {selectedDate || "Pick a date"}
              </span>
              <span className="pill ghost">Available slots</span>
            </div>
            <div className="times-list" aria-label="Time options">
              {!selectedDay && (
                <p className="muted">Select a date to see times.</p>
              )}
              {selectedDay?.slots.map((slot) => (
                <button
                  key={`${selectedDay.date}-${slot.time}`}
                  type="button"
                  className={`time-slot ${
                    selectedTime === slot.time ? "active" : ""
                  }`}
                  onClick={() => setSelectedTime(slot.time)}
                  aria-pressed={selectedTime === slot.time}
                  disabled={!slot.available}
                >
                  {formatTime(slot.time)}
                  {!slot.available && (
                    <span className="muted slot-label">Unavailable</span>
                  )}
                </button>
              ))}
            </div>
            <div className="form-grid">
              <label className="input-group">
                <span>Your name</span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                />
              </label>
              <label className="input-group">
                <span>Your email</span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@email.com"
                />
              </label>
              <label className="input-group full-width">
                <span>Notes for Jeroen</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your pup or preferences"
                  rows={3}
                />
              </label>
            </div>
            <div className="actions-row">
              <button
                type="button"
                className="button w-button"
                onClick={handleBook}
                disabled={isBooking || loading}
              >
                {isBooking ? "Booking…" : "Confirm / Book"}
              </button>
            </div>
            <p className="muted subtle">Times shown in your timezone</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingSection = () => {
  const [activeService, setActiveService] = useState(null);

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Walking Plans for Every Pup</h1>
        </div>

        <ul className="grid_4-col gap-xsmall text-align_center w-list-unstyled">
          {services.map((service) => (
            <li key={service.id} className="card on-secondary">
              <div className="card_body is-small">
                <div className="margin_bottom-auto">
                  <h4>{service.title}</h4>
                  <div className="eyebrow">{service.label}</div>
                  <p className="heading_h3">{service.price}</p>
                  <p>{service.description}</p>
                </div>
                <div className="button-group is-align-center">
                  <button
                    type="button"
                    className="button w-button"
                    onClick={() => {
                      console.log("analytics: service_selected", {
                        serviceId: service.id,
                      });
                      setActiveService(service);
                    }}
                  >
                    Check availability
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeService && (
        <BookingModal
          service={activeService}
          onClose={() => setActiveService(null)}
        />
      )}
      <style>{`
        .card.on-secondary {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card.on-secondary:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .button.w-button {
          transition: background-color 0.25s ease, color 0.25s ease;
        }
        .button.w-button:hover {
          background-color: #5a3ec8;
          color: #fff;
        }
        .booking-overlay {
          position: fixed;
          inset: 0;
          background: rgba(9, 5, 20, 0.5);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 1000;
        }
        .booking-modal {
          background: linear-gradient(135deg, #1a1132, #1f0f3a);
          border-radius: 16px;
          width: min(1100px, 100%);
          color: #f2ecff;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          position: relative;
        }
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .booking-header h3 {
          margin: 6px 0 4px;
        }
        .booking-body {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 16px;
          padding: 20px 24px 24px;
        }
        .calendar-card,
        .times-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 18px;
        }
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .toggle-group {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 4px;
          gap: 6px;
        }
        .weekday-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          font-size: 11px;
          color: #b9b3cc;
          margin-bottom: 6px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .day {
          height: 46px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.03);
          color: #f2ecff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .day:hover {
          background: rgba(116, 86, 255, 0.2);
          border-color: rgba(116, 86, 255, 0.5);
        }
        .day.selected {
          background: linear-gradient(145deg, #6e4bd8, #7c5df2);
          border-color: transparent;
          color: #0c061a;
          box-shadow: 0 6px 16px rgba(124, 93, 242, 0.4);
        }
        .day.muted {
          color: #8579a8;
          border-style: dashed;
        }
        .times-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .times-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px; /* adjust as needed */
          overflow-y: auto;
          padding-right: 6px;
        }
        .times-list::-webkit-scrollbar {
          width: 6px;
        }
        .times-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .times-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }

        .time-slot {
          width: 100%;
          border-radius: 12px;
          padding: 12px 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #f2ecff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .time-slot:hover {
          background: rgba(124, 93, 242, 0.18);
          border-color: rgba(124, 93, 242, 0.4);
        }
        .time-slot.active {
          background: linear-gradient(145deg, #6e4bd8, #7c5df2);
          color: #0c061a;
          box-shadow: 0 6px 16px rgba(124, 93, 242, 0.4);
        }
        .slot-label {
          margin-left: 8px;
          font-size: 12px;
        }
        .pill {
          border: none;
          padding: 8px 12px;
          border-radius: 12px;
          background: transparent;
          color: #f2ecff;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.2s ease;
        }
        .pill.active {
          background: #f1ddff;
          color: #2a1349;
        }
        .pill.ghost {
          background: rgba(255, 255, 255, 0.08);
          color: #dcd4f2;
          font-weight: 600;
        }
        .close-button {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          color: #f2ecff;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .close-button:hover {
          background: rgba(255, 255, 255, 0.18);
        }
        .muted {
          color: #b9b3cc;
        }
        .muted.subtle {
          font-size: 13px;
          text-align: right;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 16px 0;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #e7def9;
          font-weight: 600;
        }
        .input-group input,
        .input-group textarea {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.1);
          padding: 10px 12px;
          color: #f8f6ff;
          font-size: 14px;
        }
        .input-group textarea {
          resize: vertical;
        }
        .input-group.full-width {
          grid-column: 1 / -1;
        }
        .actions-row {
          margin-top: 4px;
          display: flex;
          justify-content: flex-end;
        }
        .error-banner,
        .success-banner {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-weight: 600;
        }
        .error-banner {
          background: rgba(255, 99, 132, 0.15);
          color: #ff96a6;
          border: 1px solid rgba(255, 99, 132, 0.35);
        }
        .success-banner {
          background: rgba(52, 211, 153, 0.2);
          color: #c2f8e4;
          border: 1px solid rgba(52, 211, 153, 0.4);
        }
        @media (max-width: 900px) {
          .booking-body {
            grid-template-columns: 1fr;
          }
          .times-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default PricingSection;
