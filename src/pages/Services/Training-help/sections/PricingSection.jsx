import React, { useMemo, useState } from "react";

const services = [
  {
    id: "quick-sniff",
    title: "Quick Sniff & Stroll",
    label: "30-Min Walks",
    price: "€7/walk",
    description: "Perfect for potty breaks, puppy zoomies, or a little leg stretch between naps.",
    duration: "30 Min Meeting",
  },
  {
    id: "daily-doggie",
    title: "Daily Doggie Adventure",
    label: "60-Min Walks",
    price: "€12/walk",
    description: "An hour of tail wags, sniffing every tree, and coming home happily tired.",
    duration: "60 Min Session",
  },
  {
    id: "mega-adventure",
    title: "Mega Adventure Walk",
    label: "120-min walks",
    price: "€22/walk",
    description: "Double the time, double the fun — great for big explorers or extra energy days.",
    duration: "2 Hour Adventure",
  },
  {
    id: "custom-walk",
    title: "Your Walk, Your Way",
    label: "Custom walk",
    price: "Tailored",
    description: "Need a special route or timing? Let’s make it paw-fect for your pup.",
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
  const [busySlots, setBusySlots] = useState(new Set());
  const [availabilityStatus, setAvailabilityStatus] = useState("idle");
  const calendarDays = useMemo(() => buildCalendar(), []);

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
  ];

  const formatTime = (slot) => {
    if (is24h) return slot;
    const [hourStr, minutes] = slot.split(":");
    const hour = Number(hourStr);
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}:${minutes} ${suffix}`;
  };

  const checkOutlookAvailability = async () => {
    setAvailabilityStatus("checking");
    try {
      if (process.env.REACT_APP_OUTLOOK_AVAILABILITY_URL) {
        const response = await fetch(process.env.REACT_APP_OUTLOOK_AVAILABILITY_URL);
        if (!response.ok) {
          throw new Error("Outlook availability request failed");
        }
        const data = await response.json();
        setBusySlots(new Set(data.busy || []));
        setAvailabilityStatus("synced");
      } else {
        setBusySlots(new Set(["10:30", "12:00", "13:00"]));
        setAvailabilityStatus("demo");
      }
    } catch (error) {
      console.error(error);
      setAvailabilityStatus("error");
    }
  };

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="booking-modal">
        <header className="booking-header">
          <div>
            <p className="muted label">Jeroen & Paws</p>
            <h3>{service.title}</h3>
            <p className="muted subtle">{service.duration} · Jeroen van Elderen · Europe/Dublin</p>
          </div>
          <div className="header-actions">
            <div className="toggle-group" role="group" aria-label="Time display format">
              <button
                type="button"
                className={`pill ${!is24h ? "ghost" : ""}`}
                onClick={() => setIs24h(false)}
              >
                12h
              </button>
              <button
                type="button"
                className={`pill ${is24h ? "ghost" : ""}`}
                onClick={() => setIs24h(true)}
              >
                24h
              </button>
            </div>
            <button className="close-button" type="button" onClick={onClose} aria-label="Close booking">
              ×
            </button>
          </div>
        </header>

        <div className="booking-body">
          <div className="calendar-card">
            <div className="calendar-header">
              <div>
                <p className="muted">November 2025</p>
                <h4 className="month-title">Tue 18</h4>
              </div>
              <div className="calendar-nav" aria-label="Month navigation">
                <button type="button" className="nav-button" aria-label="Previous month">
                  ←
                </button>
                <button type="button" className="nav-button" aria-label="Next month">
                  →
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
                    className={`day ${isSelected ? "selected" : ""} ${isMuted ? "muted" : ""}`}
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
              <div>
                <p className="muted">Time shown in your timezone</p>
                <h4 className="month-title">Tue 18</h4>
              </div>
              <div className="pill ghost duration-chip">{service.duration}</div>
            </div>
            <button type="button" className="outlook-button" onClick={checkOutlookAvailability}>
              Check with Outlook availability
            </button>
            <div className="availability-note">
              {availabilityStatus === "synced" && "Busy times synced from Outlook"}
              {availabilityStatus === "demo" && "Showing a sample of busy times (connect Outlook to sync)"}
              {availabilityStatus === "checking" && "Checking your Outlook calendar..."}
              {availabilityStatus === "error" && "Could not sync Outlook. Try again."}
            </div>
            <div className="times-list" aria-label="Time options">
              {timeSlots.map((slot) => {
                const isBusy = busySlots.has(slot);
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot ${isSelected ? "active" : ""} ${isBusy ? "busy" : ""}`}
                    onClick={() => !isBusy && setSelectedTime(slot)}
                    aria-pressed={isSelected}
                    disabled={isBusy}
                  >
                    <span>{formatTime(slot)}</span>
                    {isBusy && <span className="slot-status">Busy in Outlook</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <p className="watermark">jeroenandpaws.com</p>
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
                  <button type="button" className="button w-button" onClick={() => setActiveService(service)}>
                    Check availability
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {activeService && <BookingModal service={activeService} onClose={() => setActiveService(null)} />}

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
          background: radial-gradient(circle at 20% 20%, rgba(124, 93, 242, 0.2), rgba(10, 4, 26, 0.95));
          display: grid;
          place-items: center;
          padding: 24px;
          z-index: 1000;
        }
        .booking-modal {
          background: linear-gradient(160deg, #120c2b, #09051d);
          border-radius: 24px;
          width: min(1100px, 100%);
          color: #f5eaff;
          box-shadow: 0 18px 40px rgba(5, 0, 26, 0.65);
          overflow: hidden;
          border: 1px solid #2f1b59;
        }
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid #1f123d;
          background: rgba(255, 255, 255, 0.02);
        }
        .booking-header h3 {
          margin: 4px 0 2px;
        }
        .booking-body {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 16px;
          padding: 20px 24px 24px;
        }
        .calendar-card,
        .times-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #271645;
          border-radius: 18px;
          padding: 18px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }
        .month-title {
          font-size: 18px;
          margin: 2px 0 0;
          color: #fff;
        }
        .toggle-group {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 4px;
          gap: 6px;
          border: 1px solid #2f1b59;
        }
        .weekday-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          font-size: 11px;
          color: #9d87c8;
          margin-bottom: 6px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .day {
          height: 52px;
          border-radius: 14px;
          border: 1px solid #2f1b59;
          background: linear-gradient(180deg, #1f123d, #140c2e);
          color: #e4d8ff;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 8px 14px rgba(0, 0, 0, 0.2);
        }
        .day:hover {
          background: linear-gradient(180deg, #2f1c57, #1a0f3a);
          border-color: #5f37d6;
        }
        .day.selected {
          background: linear-gradient(180deg, #6f35e9, #5125c8);
          border-color: #9a6cff;
          color: #fff;
          box-shadow: 0 12px 22px rgba(93, 59, 219, 0.4);
        }
        .day.muted {
          color: #6d5b95;
          border-style: dashed;
        }
        .times-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .times-list {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        .time-slot {
          width: 100%;
          border-radius: 14px;
          padding: 14px 12px;
          border: 1px solid #2f1b59;
          background: linear-gradient(120deg, #1f123d, #140c2e);
          color: #f5eaff;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .time-slot:hover {
          background: linear-gradient(120deg, #2f1c57, #1a0f3a);
          border-color: #5f37d6;
        }
        .time-slot.active {
          background: linear-gradient(160deg, #6f35e9, #5125c8);
          color: #fff;
          box-shadow: 0 10px 18px rgba(93, 59, 219, 0.35);
        }
        .time-slot.busy {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .slot-status {
          font-size: 12px;
          color: #d6c1ff;
        }
        .pill {
          border: 1px solid transparent;
          padding: 8px 12px;
          border-radius: 12px;
          background: transparent;
          color: #f5eaff;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .pill.ghost {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-color: #5f37d6;
        }
        .close-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #2f1b59;
          border-radius: 12px;
          width: 40px;
          height: 40px;
          color: #f5eaff;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .close-button:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }
        .muted {
          color: #c1b4e4;
        }
        .muted.subtle {
          font-size: 13px;
          color: #9786be;
        }
        .muted.label {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          font-size: 12px;
        }
        .calendar-nav {
          display: flex;
          gap: 8px;
        }
        .nav-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #2f1b59;
          color: #f5eaff;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          cursor: pointer;
        }
        .outlook-button {
          width: 100%;
          border-radius: 12px;
          padding: 10px 12px;
          background: linear-gradient(120deg, #6f35e9, #5125c8);
          border: 1px solid #7d4cff;
          color: #fff;
          font-weight: 700;
          margin-bottom: 8px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 8px 18px rgba(93, 59, 219, 0.35);
        }
        .outlook-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 22px rgba(93, 59, 219, 0.45);
        }
        .availability-note {
          min-height: 22px;
          margin-bottom: 8px;
          color: #c1b4e4;
          font-size: 13px;
        }
        .duration-chip {
          background: rgba(255, 255, 255, 0.08);
        }
        .watermark {
          margin-top: 12px;
          text-align: center;
          color: #7767a1;
          font-weight: 700;
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