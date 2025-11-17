import React, { useState, useMemo } from "react";

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

const buildCalendar = () => {
  const startPadding = ["27", "28", "29", "30", "31"];
  const monthDays = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  return [...startPadding, ...monthDays];
};

const BookingModal = ({ service, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("18");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [is24h, setIs24h] = useState(true);
  const calendarDays = useMemo(() => buildCalendar(), []);

  const generateTimeSlots = (start = "09:00", end = "17:30", interval = 15) => {
    const slots = [];
    let [hour, minute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    while (hour < endHour || (hour === endHour && minute <= endMinute)) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      slots.push(`${hh}:${mm}`);

      minute += interval;
      if (minute >= 60) {
        minute -= 60;
        hour++;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatTime = (slot) => {
    if (is24h) return slot;
    const [hourStr, minutes] = slot.split(":");
    const hour = Number(hourStr);
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}:${minutes} ${suffix}`;
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
                <p className="muted">Europe/Dublin</p>
                <h4>November 2025</h4>
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
            <div className="weekday-row">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <span key={day} className="weekday">
                  {day}
                </span>
              ))}
            </div>
            <div className="calendar-grid" aria-label="Calendar">
              {calendarDays.map((day) => {
                const isMuted = Number(day) <= 2;
                const isSelected = day === selectedDate;
                return (
                  <button
                    key={day}
                    type="button"
                    className={`day ${isSelected ? "selected" : ""} ${
                      isMuted ? "muted" : ""
                    }`}
                    onClick={() => setSelectedDate(day)}
                    aria-pressed={isSelected}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="times-card">
            <div className="times-header">
              <span className="pill ghost">Tue {selectedDate}</span>
              <span className="pill ghost">Available slots</span>
            </div>
            <div className="times-list" aria-label="Time options">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time-slot ${
                    selectedTime === slot ? "active" : ""
                  }`}
                  onClick={() => setSelectedTime(slot)}
                  aria-pressed={selectedTime === slot}
                >
                  {formatTime(slot)}
                </button>
              ))}
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
                    onClick={() => setActiveService(service)}
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
      <style jsx>{`
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
        @media (max-width: 900px) {
          .booking-body {
            grid-template-columns: 1fr;
          }
          .times-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
};

export default PricingSection;
