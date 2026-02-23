import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { generateDemoAvailability } from "../utils";
import { computeApiBaseUrl, getCachedAvailability, prefetchAvailability } from "../availabilityCache";

const BUSINESS_TZ = "Europe/Dublin";
const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 20;
const SLOT_STEP_MINUTES = 30;

const VIEW_MODES = ["day", "week", "month"];
const COMPOSER_TABS = ["details", "pets", "additional", "confirm"];

const makeIsoDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildTimes = () => {
  const slots = [];
  for (let mins = SLOT_START_HOUR * 60; mins < SLOT_END_HOUR * 60; mins += SLOT_STEP_MINUTES) {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
};

const ALL_TIMES = buildTimes();

const formatDisplayDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const BookingModal = ({ service, onClose }) => {
  const { profile, isAuthenticated } = useAuth();
  const [stage, setStage] = useState(isAuthenticated ? "calendar" : "register");
  const [viewMode, setViewMode] = useState("week");
  const [composerTab, setComposerTab] = useState("details");

  const [availability, setAvailability] = useState(() => {
    const cached = service?.id ? getCachedAvailability(service.id) : null;
    return cached || { dates: [] };
  });
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilitySource, setAvailabilitySource] = useState("live");

  const [visibleDate, setVisibleDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");

  const [clientName, setClientName] = useState(profile?.client?.name || "");
  const [clientEmail, setClientEmail] = useState(profile?.client?.email || "");
  const [clientPhone, setClientPhone] = useState(profile?.client?.phone || "");
  const [clientEircode, setClientEircode] = useState(profile?.client?.eircode || "");
  const [password, setPassword] = useState("");

  const [petNames, setPetNames] = useState("");
  const [additionalCare, setAdditionalCare] = useState([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const apiBaseUrl = useMemo(() => computeApiBaseUrl(), []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!service?.id) {
          const demo = generateDemoAvailability(service?.durationMinutes || 30);
          if (mounted) {
            setAvailability(demo);
            setAvailabilitySource("demo");
          }
          return;
        }

        prefetchAvailability(service);
        const query = new URLSearchParams({
          serviceId: String(service.id),
          durationMinutes: String(service?.durationMinutes || 30),
        });
        if (clientEircode.trim()) {
          query.set("clientAddress", clientEircode.trim());
        }

        const response = await fetch(`${apiBaseUrl}/api/availability?${query.toString()}`);
        if (!response.ok) {
          throw new Error(`Availability unavailable (${response.status})`);
        }
        const payload = await response.json();
        if (mounted) {
          setAvailability(payload || { dates: [] });
          setAvailabilityError("");
          setAvailabilitySource("live");
        }
      } catch (error) {
        if (!mounted) return;
        setAvailability(generateDemoAvailability(service?.durationMinutes || 30));
        setAvailabilityError("Live calendar unavailable. Showing demo calendar.");
        setAvailabilitySource("demo");
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [apiBaseUrl, clientEircode, service]);

  const availabilityMap = useMemo(() => {
    const map = {};
    (availability?.dates || []).forEach((entry) => {
      if (entry?.date) map[entry.date] = entry;
    });
    return map;
  }, [availability]);

  const travelBufferSlots = useMemo(() => {
    const eircode = (clientEircode || "").replace(/\s+/g, "").toUpperCase();
    if (!eircode) return 0;
    if (eircode.startsWith("A98")) return 1;
    if (eircode.startsWith("D")) return 1;
    return 2;
  }, [clientEircode]);

  const daySlots = useCallback(
    (isoDate) => {
      const day = availabilityMap[isoDate];
      const apiSlots = day?.slots || [];
      const apiSlotMap = new Map(apiSlots.map((slot) => [slot.time, slot]));

      const slots = ALL_TIMES.map((time) => {
        const source = apiSlotMap.get(time);
        const available = Boolean(source?.available);
        return {
          time,
          state: available ? "open" : "booked",
          reason: available ? "Open" : "Booked",
        };
      });

      if (travelBufferSlots > 0) {
        const bookedIndexes = slots
          .map((slot, index) => ({ slot, index }))
          .filter(({ slot }) => slot.state === "booked")
          .map(({ index }) => index);

        bookedIndexes.forEach((index) => {
          for (let offset = 1; offset <= travelBufferSlots; offset += 1) {
            const prev = index - offset;
            const next = index + offset;
            if (slots[prev] && slots[prev].state === "open") {
              slots[prev] = { ...slots[prev], state: "travel", reason: "Booked (travel)" };
            }
            if (slots[next] && slots[next].state === "open") {
              slots[next] = { ...slots[next], state: "travel", reason: "Booked (travel)" };
            }
          }
        });
      }

      return slots;
    },
    [availabilityMap, travelBufferSlots]
  );

  const currentDate = selectedDate || makeIsoDate(new Date());
  const currentDaySlots = useMemo(() => daySlots(currentDate), [currentDate, daySlots]);

  const plannerDates = useMemo(() => {
    const anchor = new Date(`${currentDate}T00:00:00`);
    if (viewMode === "day") return [currentDate];
    if (viewMode === "week") {
      const monday = new Date(anchor);
      const weekday = (monday.getDay() + 6) % 7;
      monday.setDate(monday.getDate() - weekday);
      return Array.from({ length: 7 }, (_, idx) => {
        const next = new Date(monday);
        next.setDate(monday.getDate() + idx);
        return makeIsoDate(next);
      });
    }

    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const days = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, idx) => makeIsoDate(new Date(first.getFullYear(), first.getMonth(), idx + 1)));
  }, [currentDate, viewMode]);

  const canContinueFromRegister = useMemo(() => {
    if (isAuthenticated) return true;
    return Boolean(clientName.trim() && clientEmail.trim() && clientPhone.trim() && clientEircode.trim() && password.trim());
  }, [clientName, clientEircode, clientEmail, clientPhone, isAuthenticated, password]);

  const petsLabel = petNames
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .join(", ") || "Your dog";
  const bookingTitle = `${petsLabel} - ${service?.title || "Service"}`;

  const pickSlot = (isoDate, slotTime) => {
    const slot = daySlots(isoDate).find((item) => item.time === slotTime);
    if (!slot || slot.state !== "open") return;

    const [h, m] = slotTime.split(":").map(Number);
    const end = h * 60 + m + SLOT_STEP_MINUTES;
    const endHour = String(Math.floor(end / 60)).padStart(2, "0");
    const endMin = String(end % 60).padStart(2, "0");

    setSelectedDate(isoDate);
    setSelectedStart(slotTime);
    setSelectedEnd(`${endHour}:${endMin}`);
    setStage("composer");
    setComposerTab("details");
  };

  const submitBooking = async () => {
    if (!selectedDate || !selectedStart || !selectedEnd) {
      setSubmitMessage("Pick a valid date/time first.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service?.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          client_eircode: clientEircode,
          dog_names: petNames,
          additionals: additionalCare,
          date: selectedDate,
          start_time: selectedStart,
          end_time: selectedEnd,
          notes,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");
      setSubmitMessage("Booking request submitted.");
      setStage("calendar");
    } catch (error) {
      setSubmitMessage("Could not submit booking right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="booking-shell">
        <header className="booking-shell__header">
          <div>
            <p className="eyebrow">{service?.duration || "Visit"}</p>
            <h3>{service?.title || "Booking"}</h3>
            <p className="muted">Jeroen van Elderen · Jeroen & Paws</p>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close booking">×</button>
        </header>

        {!isAuthenticated && stage === "register" && (
          <section className="card">
            <h4>Create account first</h4>
            <p className="muted">Before choosing slots, clients must register an account.</p>
            <div className="grid-2">
              <label className="input-group"><span>Name</span><input value={clientName} onChange={(e) => setClientName(e.target.value)} /></label>
              <label className="input-group"><span>Email</span><input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></label>
              <label className="input-group"><span>Phone</span><input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></label>
              <label className="input-group"><span>Eircode</span><input value={clientEircode} onChange={(e) => setClientEircode(e.target.value.toUpperCase())} /></label>
              <label className="input-group full"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            </div>
            <div className="actions-row">
              <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
              <button type="button" className="button" disabled={!canContinueFromRegister} onClick={() => setStage("calendar")}>Continue to calendar</button>
            </div>
          </section>
        )}

        {stage === "calendar" && (
          <section className="card">
            <div className="calendar-topbar">
              <div className="toggle-group">
                {VIEW_MODES.map((mode) => (
                  <button key={mode} type="button" className={`ghost-button tiny ${viewMode === mode ? "is-active" : ""}`} onClick={() => setViewMode(mode)}>
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              <div className="muted">{availabilitySource === "live" ? "Live owner calendar check" : "Demo availability"} · Travel buffer: {travelBufferSlots * SLOT_STEP_MINUTES} min · Time zone: {BUSINESS_TZ}</div>
            </div>

            {availabilityError && <p className="muted subtle">{availabilityError}</p>}

            {viewMode === "month" ? (
              <div className="month-grid">
                {plannerDates.map((isoDate) => {
                  const openCount = daySlots(isoDate).filter((slot) => slot.state === "open").length;
                  return (
                    <button key={isoDate} type="button" className={`month-cell ${isoDate === currentDate ? "active" : ""}`} onClick={() => setSelectedDate(isoDate)}>
                      <strong>{new Date(`${isoDate}T00:00:00`).getDate()}</strong>
                      <span>{openCount} open</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="planner-table">
                <div className="planner-header">
                  <span />
                  {plannerDates.map((isoDate) => (
                    <button key={isoDate} type="button" className={`planner-day ${isoDate === currentDate ? "active" : ""}`} onClick={() => setSelectedDate(isoDate)}>
                      {formatDisplayDate(isoDate)}
                    </button>
                  ))}
                </div>

                {ALL_TIMES.map((time) => (
                  <div className="planner-row" key={`row-${time}`}>
                    <span className="planner-time">{time}</span>
                    {plannerDates.map((isoDate) => {
                      const slot = daySlots(isoDate).find((entry) => entry.time === time);
                      const isOpen = slot?.state === "open";
                      return (
                        <button
                          key={`${isoDate}-${time}`}
                          type="button"
                          className={`planner-cell ${slot?.state || "booked"}`}
                          onClick={() => pickSlot(isoDate, time)}
                          disabled={!isOpen}
                        >
                          {slot?.reason || "Booked"}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="actions-row">
              <button type="button" className="ghost-button" onClick={onClose}>Close</button>
              <button type="button" className="button" onClick={() => setStage("composer")} disabled={!selectedStart || !selectedDate}>Open selected slot</button>
            </div>
          </section>
        )}

        {stage === "composer" && (
          <section className="card composer-shell">
            <div className="composer-toolbar">
              <div className="toggle-group">
                {COMPOSER_TABS.map((tab) => (
                  <button key={tab} type="button" className={`ghost-button tiny ${composerTab === tab ? "is-active" : ""}`} onClick={() => setComposerTab(tab)}>
                    {tab === "additional" ? "Additional care" : tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <button type="button" className="ghost-button tiny" onClick={() => setStage("calendar")}>Back to calendar</button>
            </div>

            <div className="composer-layout">
              <div className="composer-main">
                {composerTab === "details" && (
                  <div className="grid-2">
                    <label className="input-group full"><span>Title</span><input value={bookingTitle} readOnly /></label>
                    <label className="input-group"><span>Date</span><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></label>
                    <label className="input-group"><span>Start</span><input type="time" step={1800} value={selectedStart} onChange={(e) => setSelectedStart(e.target.value)} /></label>
                    <label className="input-group"><span>End</span><input type="time" step={1800} value={selectedEnd} onChange={(e) => setSelectedEnd(e.target.value)} /></label>
                    <label className="input-group"><span>Location (Eircode)</span><input value={clientEircode} readOnly /></label>
                    <label className="input-group full"><span>Description</span><textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Booking notes" /></label>
                  </div>
                )}

                {composerTab === "pets" && (
                  <div className="stack">
                    <label className="input-group full">
                      <span>Dog name(s)</span>
                      <input value={petNames} onChange={(e) => setPetNames(e.target.value)} placeholder="Compass, Luna" />
                    </label>
                    <p className="muted">This replaces participant invites. Only client and owner are included.</p>
                  </div>
                )}

                {composerTab === "additional" && (
                  <div className="stack">
                    {[
                      "Medication support",
                      "Photo update",
                      "Towel dry",
                      "Extended feeding",
                    ].map((item) => (
                      <label className="checkbox-row" key={item}>
                        <input
                          type="checkbox"
                          checked={additionalCare.includes(item)}
                          onChange={(event) => {
                            setAdditionalCare((prev) =>
                              event.target.checked ? [...prev, item] : prev.filter((it) => it !== item)
                            );
                          }}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                )}

                {composerTab === "confirm" && (
                  <div className="stack">
                    <h4>{bookingTitle}</h4>
                    <p className="muted">{formatDisplayDate(selectedDate)} · {selectedStart} - {selectedEnd}</p>
                    <p className="muted">Location: {clientEircode || "Missing Eircode"}</p>
                    <p className="muted">Additional care: {additionalCare.length ? additionalCare.join(", ") : "None"}</p>
                    <button type="button" className="button" disabled={submitting} onClick={submitBooking}>
                      {submitting ? "Submitting..." : "Submit booking"}
                    </button>
                    {submitMessage && <p className="muted subtle">{submitMessage}</p>}
                  </div>
                )}
              </div>

              <aside className="composer-rail">
                <h5>Day calendar</h5>
                <p className="muted subtle">Gray blocks are booked or travel-blocked.</p>
                <div className="rail-grid">
                  {currentDaySlots.map((slot) => (
                    <button
                      key={`rail-${slot.time}`}
                      type="button"
                      className={`rail-cell ${slot.state} ${selectedStart === slot.time ? "active" : ""}`}
                      disabled={slot.state !== "open"}
                      onClick={() => pickSlot(currentDate, slot.time)}
                    >
                      <span>{slot.time}</span>
                      <strong>{slot.reason}</strong>
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        .booking-overlay { position: fixed; inset: 0; background: rgba(8, 5, 20, 0.82); z-index: 9999; padding: 24px; overflow: auto; }
        .booking-shell { max-width: 1240px; margin: 0 auto; background: linear-gradient(145deg,#1a1132,#1f0f3a); border-radius: 18px; border: 1px solid rgba(255,255,255,.1); color: #f3eefe; box-shadow: 0 30px 70px rgba(0,0,0,.45); }
        .booking-shell__header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,.08); }
        .booking-shell__header h3 { margin: 6px 0; }
        .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; opacity: .8; margin: 0; }
        .card { padding: 18px 24px 24px; display: grid; gap: 14px; }
        .muted { color: #c8bddf; margin: 0; }
        .muted.subtle { font-size: 13px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
        .input-group { display:flex; flex-direction:column; gap:6px; font-weight:600; }
        .input-group input,.input-group textarea { background: rgba(0,0,0,.18); color:#f8f3ff; border:1px solid rgba(255,255,255,.18); border-radius:10px; padding:10px 12px; }
        .input-group textarea { resize: vertical; }
        .input-group.full { grid-column: 1 / -1; }
        .actions-row { display:flex; justify-content:flex-end; gap:10px; }
        .button { border:none; border-radius:12px; padding:10px 14px; background: linear-gradient(145deg,#6e4bd8,#7c5df2); color:#fff; font-weight:700; cursor:pointer; }
        .button:disabled { opacity:.5; cursor:not-allowed; }
        .ghost-button { border:1px solid rgba(255,255,255,.3); border-radius:12px; background:transparent; color:#f3eefe; padding:9px 12px; cursor:pointer; }
        .ghost-button.tiny { font-size:12px; padding:7px 10px; }
        .ghost-button.is-active { background: rgba(124,93,242,.3); border-color: rgba(124,93,242,.75); }
        .close-button { border:1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color:#fff; width:36px; height:36px; border-radius:999px; font-size:22px; cursor:pointer; }
        .calendar-topbar { display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; }
        .toggle-group { display:flex; gap:8px; flex-wrap:wrap; }

        .planner-table { display:grid; gap:8px; overflow:auto; }
        .planner-header,.planner-row { display:grid; grid-template-columns: 72px repeat(7, minmax(110px,1fr)); gap:8px; align-items:center; }
        .planner-day { border:1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.06); color:#efe8ff; border-radius:10px; padding:8px; text-align:left; }
        .planner-day.active { border-color: rgba(124,93,242,.8); background: rgba(124,93,242,.25); }
        .planner-time { text-align:right; color:#c8bddf; font-size:12px; }
        .planner-cell { border:1px solid rgba(255,255,255,.14); border-radius:8px; padding:8px; font-size:12px; font-weight:700; color:#efe8ff; }
        .planner-cell.open { background: rgba(124,93,242,.22); border-color: rgba(124,93,242,.6); cursor:pointer; }
        .planner-cell.booked,.planner-cell.travel { background: rgba(120,120,130,.45); border-color: rgba(180,180,190,.45); color:#e8e8eb; }

        .month-grid { display:grid; grid-template-columns: repeat(7,minmax(90px,1fr)); gap:8px; }
        .month-cell { text-align:left; border:1px solid rgba(255,255,255,.14); border-radius:12px; background: rgba(255,255,255,.04); color:#f2ecff; padding:10px; display:grid; gap:6px; }
        .month-cell.active { border-color: rgba(124,93,242,.8); background: rgba(124,93,242,.26); }

        .composer-shell { gap: 12px; }
        .composer-toolbar { display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap; border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:10px; }
        .composer-layout { display:grid; grid-template-columns: minmax(0,1.6fr) minmax(280px,1fr); gap:14px; }
        .composer-main,.composer-rail { border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:12px; background: rgba(255,255,255,.04); }
        .stack { display:grid; gap:10px; }
        .checkbox-row { display:flex; gap:10px; align-items:center; }
        .rail-grid { display:grid; gap:8px; max-height:520px; overflow:auto; }
        .rail-cell { border:1px solid rgba(255,255,255,.18); border-radius:10px; background: rgba(255,255,255,.04); color:#f3eefe; padding:8px 10px; display:flex; justify-content:space-between; }
        .rail-cell.open { border-color: rgba(124,93,242,.6); background: rgba(124,93,242,.2); cursor:pointer; }
        .rail-cell.booked,.rail-cell.travel { background: rgba(120,120,130,.42); border-color: rgba(180,180,190,.4); color:#ececf0; }
        .rail-cell.active { box-shadow: 0 0 0 2px rgba(124,93,242,.85); }

        @media (max-width: 1024px) {
          .grid-2 { grid-template-columns: 1fr; }
          .composer-layout { grid-template-columns: 1fr; }
          .planner-header,.planner-row { grid-template-columns: 64px repeat(7,minmax(95px,1fr)); }
        }
      `}</style>
    </div>
  );
};

export default BookingModal;
