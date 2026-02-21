import React, { useMemo, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const START_HOUR = 7;
const END_HOUR = 22;
const SLOT_MINUTES = 30;

const EVENT_COLORS = {
  walk: "#1f7a39",
  checkin: "#0c6d7f",
  social: "#4f2b82",
  admin: "#2f3543",
};

const statusOptions = [
  "Pending payment",
  "Confirmed",
  "Needs follow-up",
  "Cancelled",
];

const toIsoDay = (date) => date.toISOString().slice(0, 10);

const setDateTime = (dayIso, hhmm) => {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date(`${dayIso}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const getMonday = (seedDate) => {
  const date = new Date(seedDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date;
};

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const toInputTime = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const initialEvents = [
  {
    id: 1,
    title: "Meala & Lola - Walk",
    start: "2026-02-16T11:00:00",
    end: "2026-02-16T11:30:00",
    status: "Confirmed",
    color: EVENT_COLORS.social,
    location: "Neighborhood park",
    notes: "Both are leash reactive near bicycles.",
  },
  {
    id: 2,
    title: "Walk - Leia",
    start: "2026-02-20T11:00:00",
    end: "2026-02-20T12:00:00",
    status: "Confirmed",
    color: EVENT_COLORS.walk,
    location: "Client home",
    notes: "Bring treats for recall drills.",
  },
  {
    id: 3,
    title: "Kaiser - Check-in",
    start: "2026-02-20T12:30:00",
    end: "2026-02-20T13:00:00",
    status: "Pending payment",
    color: EVENT_COLORS.checkin,
    location: "Apt 3B",
    notes: "Water plants and refill food bowl.",
  },
  {
    id: 4,
    title: "J&P • Standard stroll",
    start: "2026-02-21T10:00:00",
    end: "2026-02-21T10:30:00",
    status: "Pending payment",
    color: EVENT_COLORS.admin,
    location: "-",
    notes: "Created from website request.",
  },
];

const Pricing = () => {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date("2026-02-16")));
  const [events, setEvents] = useState(initialEvents);
  const [selectedId, setSelectedId] = useState(initialEvents[0].id);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const selectedEvent = events.find((event) => event.id === selectedId) || null;

  const openNewEvent = (dayIso, hhmm) => {
    const start = setDateTime(dayIso, hhmm);
    const end = new Date(start.getTime() + 30 * 60000);
    const nextId = Math.max(0, ...events.map((event) => event.id)) + 1;

    const draft = {
      id: nextId,
      title: "",
      start: start.toISOString(),
      end: end.toISOString(),
      status: "Pending payment",
      color: EVENT_COLORS.walk,
      location: "",
      notes: "",
    };

    setEvents((current) => [...current, draft]);
    setSelectedId(nextId);
  };

  const updateSelected = (patch) => {
    if (!selectedEvent) {
      return;
    }

    setEvents((current) =>
      current.map((event) => (event.id === selectedEvent.id ? { ...event, ...patch } : event))
    );
  };

  const deleteSelected = () => {
    if (!selectedEvent) {
      return;
    }

    setEvents((current) => current.filter((event) => event.id !== selectedEvent.id));
    setSelectedId((current) => {
      if (current !== selectedEvent.id) {
        return current;
      }
      const next = events.find((event) => event.id !== selectedEvent.id);
      return next ? next.id : null;
    });
  };

  const gotoTodayWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  const moveWeek = (delta) => {
    setWeekStart((current) => addDays(current, delta * 7));
  };

  return (
    <main className="outlook-booking">
      <section className="board">
        <header className="toolbar">
          <div className="toolbar__group">
            <button type="button" onClick={gotoTodayWeek}>Vandaag</button>
            <button type="button" aria-label="Previous week" onClick={() => moveWeek(-1)}>
              ←
            </button>
            <button type="button" aria-label="Next week" onClick={() => moveWeek(1)}>
              →
            </button>
            <h1>
              {weekStart.toLocaleDateString("nl-NL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" "}
              –
              {" "}
              {addDays(weekStart, 6).toLocaleDateString("nl-NL", {
                month: "long",
                day: "numeric",
              })}
            </h1>
          </div>
          <p>Klik op een tijdvak om een nieuwe booking te maken.</p>
        </header>

        <div className="calendar-layout">
          <div className="calendar-grid">
            <div className="calendar-grid__header">
              <div className="time-col" />
              {days.map((day) => (
                <div key={day.toISOString()} className="day-head">
                  <span>{day.toLocaleDateString("nl-NL", { weekday: "long" })}</span>
                  <strong>{day.getDate()}</strong>
                </div>
              ))}
            </div>

            <div className="calendar-grid__body">
              <div className="time-col">
                {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => (
                  <div key={`hour-${index}`} className="time-label">
                    {String(START_HOUR + index).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {days.map((day) => {
                const dayIso = toIsoDay(day);
                const dayEvents = events.filter((event) => event.start.slice(0, 10) === dayIso);

                return (
                  <div key={dayIso} className="day-column">
                    {Array.from(
                      { length: ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES },
                      (_, index) => {
                        const minutes = START_HOUR * 60 + index * SLOT_MINUTES;
                        const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
                        const mm = String(minutes % 60).padStart(2, "0");
                        const hhmm = `${hh}:${mm}`;

                        return (
                          <button
                            type="button"
                            key={`${dayIso}-${hhmm}`}
                            className="slot"
                            onClick={() => openNewEvent(dayIso, hhmm)}
                            aria-label={`Create booking on ${dayIso} at ${hhmm}`}
                          />
                        );
                      }
                    )}

                    {dayEvents.map((event) => {
                      const start = new Date(event.start);
                      const end = new Date(event.end);
                      const offsetMinutes =
                        (start.getHours() * 60 + start.getMinutes()) - START_HOUR * 60;
                      const durationMinutes = Math.max(30, (end - start) / 60000);

                      return (
                        <button
                          type="button"
                          key={event.id}
                          className={`event-card ${selectedId === event.id ? "is-selected" : ""}`}
                          style={{
                            top: `${(offsetMinutes / SLOT_MINUTES) * 26}px`,
                            height: `${Math.max(26, (durationMinutes / SLOT_MINUTES) * 26)}px`,
                            backgroundColor: event.color,
                          }}
                          onClick={() => setSelectedId(event.id)}
                        >
                          <strong>{event.title || "Nieuwe booking"}</strong>
                          <span>
                            {toInputTime(start)} - {toInputTime(end)} • {event.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="editor">
            <h2>Booking details</h2>
            {selectedEvent ? (
              <>
                <label>
                  Titel
                  <input
                    value={selectedEvent.title}
                    onChange={(event) => updateSelected({ title: event.target.value })}
                    placeholder="Bijv. Walk - Leia"
                  />
                </label>

                <div className="editor-grid">
                  <label>
                    Datum
                    <input
                      type="date"
                      value={selectedEvent.start.slice(0, 10)}
                      onChange={(event) => {
                        const day = event.target.value;
                        updateSelected({
                          start: `${day}T${selectedEvent.start.slice(11, 19)}`,
                          end: `${day}T${selectedEvent.end.slice(11, 19)}`,
                        });
                      }}
                    />
                  </label>
                  <label>
                    Van
                    <input
                      type="time"
                      value={selectedEvent.start.slice(11, 16)}
                      onChange={(event) =>
                        updateSelected({
                          start: `${selectedEvent.start.slice(0, 10)}T${event.target.value}:00`,
                        })
                      }
                    />
                  </label>
                  <label>
                    Tot
                    <input
                      type="time"
                      value={selectedEvent.end.slice(11, 16)}
                      onChange={(event) =>
                        updateSelected({
                          end: `${selectedEvent.end.slice(0, 10)}T${event.target.value}:00`,
                        })
                      }
                    />
                  </label>
                </div>

                <label>
                  Status
                  <select
                    value={selectedEvent.status}
                    onChange={(event) => updateSelected({ status: event.target.value })}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Kleur
                  <input
                    type="color"
                    value={selectedEvent.color}
                    onChange={(event) => updateSelected({ color: event.target.value })}
                  />
                </label>

                <label>
                  Locatie
                  <input
                    value={selectedEvent.location}
                    onChange={(event) => updateSelected({ location: event.target.value })}
                    placeholder="Zoeken naar locatie"
                  />
                </label>

                <label>
                  Beschrijving
                  <textarea
                    rows={4}
                    value={selectedEvent.notes}
                    onChange={(event) => updateSelected({ notes: event.target.value })}
                    placeholder="Notities voor deze booking"
                  />
                </label>

                <div className="actions">
                  <button type="button">Opslaan</button>
                  <button type="button" className="danger" onClick={deleteSelected}>
                    Verwijderen
                  </button>
                </div>
              </>
            ) : (
              <p>Selecteer of maak een booking in de kalender.</p>
            )}
          </aside>
        </div>
      </section>

      <style jsx>{`
        .outlook-booking {
          background: #141414;
          color: #f3f3f3;
          min-height: 100vh;
          padding: 24px;
        }
        .board {
          max-width: 1480px;
          margin: 0 auto;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .toolbar__group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .toolbar button {
          background: #242424;
          border: 1px solid #3a3a3a;
          color: #fff;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .toolbar h1 {
          margin: 0 0 0 6px;
          font-size: 26px;
        }
        .calendar-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 16px;
        }
        .calendar-grid {
          border: 1px solid #383838;
          border-radius: 14px;
          overflow: hidden;
          background: #1a1a1a;
        }
        .calendar-grid__header {
          display: grid;
          grid-template-columns: 64px repeat(7, 1fr);
          border-bottom: 1px solid #313131;
        }
        .day-head {
          padding: 10px;
          border-left: 1px solid #313131;
          text-transform: capitalize;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .day-head span {
          font-size: 13px;
          color: #b2b2b2;
        }
        .day-head strong {
          color: #cf9cff;
        }
        .calendar-grid__body {
          display: grid;
          grid-template-columns: 64px repeat(7, 1fr);
          max-height: 74vh;
          overflow: auto;
        }
        .time-col {
          border-right: 1px solid #313131;
          background: #171717;
        }
        .time-label {
          height: 52px;
          border-bottom: 1px dashed #2f2f2f;
          font-size: 11px;
          color: #808080;
          padding-top: 4px;
          text-align: center;
        }
        .day-column {
          position: relative;
          border-left: 1px solid #313131;
        }
        .slot {
          display: block;
          width: 100%;
          height: 26px;
          border: none;
          border-bottom: 1px dashed #2b2b2b;
          background: transparent;
        }
        .slot:hover {
          background: rgba(172, 94, 255, 0.1);
        }
        .event-card {
          position: absolute;
          left: 4px;
          right: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 6px;
          text-align: left;
          color: #f7f7f7;
          display: flex;
          flex-direction: column;
          gap: 3px;
          overflow: hidden;
        }
        .event-card strong {
          font-size: 14px;
          line-height: 1.2;
        }
        .event-card span {
          font-size: 11px;
          opacity: 0.85;
        }
        .event-card.is-selected {
          outline: 2px solid #d59dff;
        }
        .editor {
          border: 1px solid #383838;
          border-radius: 14px;
          background: #1a1a1a;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-self: start;
          position: sticky;
          top: 12px;
        }
        .editor h2 {
          margin: 0 0 6px;
        }
        .editor label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 13px;
          color: #ccc;
        }
        .editor input,
        .editor textarea,
        .editor select {
          background: #232323;
          border: 1px solid #404040;
          color: #fff;
          border-radius: 8px;
          padding: 8px;
        }
        .editor-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .actions {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-top: 6px;
        }
        .actions button {
          border-radius: 8px;
          border: 1px solid #474747;
          padding: 9px 12px;
          background: #6e3cb3;
          color: white;
          font-weight: 600;
        }
        .actions .danger {
          background: transparent;
          color: #ffb3b3;
          border-color: #9f4545;
        }
        @media (max-width: 1180px) {
          .calendar-layout {
            grid-template-columns: 1fr;
          }
          .editor {
            position: static;
          }
        }
      `}</style>
    </main>
  );
};

export default Pricing;
