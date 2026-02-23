import React, { useMemo } from "react";

const TimesSection = ({
  selectedDay,
  isDayAvailableForService,
  selectedTime,
  selectedSlotReachable = true,
  handleTimeSelection,
  formatTime,
  onContinue,
  onBack,
  canContinue,
  timesSectionRef,
  isTravelValidationPending = false,
  travelNote,
  continueLabel = "Continue",
  selectedEndTime = "",
  onEndTimeChange,
  minDurationMinutes = 30,
  durationMinutes = 60,
  onDurationChange,
  onPickSlot,
  onJumpToPets,
  onJumpToAddons,
  onJumpToSummary,
  titleText = "",
  clientEircode = "",
  notes = "",
  onNotesChange,
}) => {
  const slotOptions =
    selectedDay?.slots
      ?.filter((slot) => slot.available && (slot.reachable !== false || slot.forceVisible))
      .map((slot) => slot.time) || [];

  const timelineRows = useMemo(() => {
    if (!selectedDay?.slots) return [];
    return selectedDay.slots.map((slot) => {
      const isOpen = slot.available && slot.reachable !== false;
      const state = isOpen ? "open" : "booked";
      const reason = slot.available && slot.reachable === false ? "Booked (travel)" : isOpen ? "Open" : "Booked";
      return { ...slot, state, reason };
    });
  }, [selectedDay]);

  return (
    <div className="times-card" ref={timesSectionRef}>
      <div className="composer-toolbar">
        <div className="actions-stack">
          {onBack && (
            <button type="button" className="ghost-button" onClick={onBack}>
              Back to calendar
            </button>
          )}
          <button type="button" className="ghost-button" onClick={onJumpToPets}>
            Pets
          </button>
          <button type="button" className="ghost-button" onClick={onJumpToAddons}>
            Additional care
          </button>
          <button type="button" className="ghost-button" onClick={onJumpToSummary}>
            Confirm
          </button>
        </div>
      </div>

      <div className="composer-layout">
        <div className="composer-main">
          <div className="times-header">
            <h4>Booking details</h4>
            <button
              type="button"
              className="ghost-button"
              onClick={onContinue}
              disabled={!canContinue}
            >
              {continueLabel}
            </button>
          </div>

          {!selectedDay && <p className="muted">Select a date to see times.</p>}

          {selectedDay && !isDayAvailableForService(selectedDay) && (
            <p className="muted">No compatible start times are available for this date because of other bookings and travel buffers.</p>
          )}

          {isTravelValidationPending && (
            <p className="muted subtle">
              Enter your full Eircode to confirm travel time. {travelNote || ""}
            </p>
          )}

          {selectedDay && selectedTime && !isTravelValidationPending && !selectedSlotReachable && (
            <p className="muted subtle">Your selected time conflicts with travel buffer. Pick another slot.</p>
          )}

          <div className="slot-picker-row" aria-label="Open start times">
            {slotOptions.map((time) => {
              const isActive = selectedTime === time;
              return (
                <button
                  key={`${selectedDay?.date}-${time}`}
                  type="button"
                  className={`time-slot ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleTimeSelection(time);
                    onPickSlot?.(time);
                  }}
                  aria-pressed={isActive}
                >
                  {formatTime(time)}
                </button>
              );
            })}
          </div>

          {selectedDay && selectedTime && (
            <div className="slot-editor">
              <div className="slot-editor__grid">
                <label className="input-group full-width">
                  <span>Title</span>
                  <input type="text" value={titleText} readOnly />
                </label>

                <label className="input-group">
                  <span>Start</span>
                  <select
                    className="input-like-select"
                    value={selectedTime}
                    onChange={(event) => handleTimeSelection(event.target.value)}
                  >
                    {slotOptions.map((option) => (
                      <option value={option} key={option}>
                        {formatTime(option)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="input-group">
                  <span>End</span>
                  <input
                    type="time"
                    step={1800}
                    value={selectedEndTime}
                    onChange={(event) => onEndTimeChange?.(event.target.value)}
                  />
                </label>

                <label className="input-group full-width">
                  <span>Location (Eircode)</span>
                  <input type="text" value={clientEircode || ""} readOnly />
                </label>

                <label className="input-group full-width">
                  <span>Description</span>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) => onNotesChange?.(event.target.value)}
                    placeholder="Add notes for this booking"
                  />
                </label>

                <label className="input-group full-width">
                  <span>Duration: {durationMinutes} mins</span>
                  <input
                    type="range"
                    min={minDurationMinutes}
                    max={480}
                    step={30}
                    value={durationMinutes}
                    onChange={(event) => onDurationChange?.(Number(event.target.value))}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <aside className="composer-day-rail">
          <h5>Day planner</h5>
          <p className="muted subtle">Unavailable and travel-blocked slots are shown as booked.</p>
          <div className="planner-rail-grid">
            {timelineRows.map((slot) => {
              const active = selectedTime === slot.time;
              return (
                <button
                  key={`rail-${selectedDay?.date}-${slot.time}`}
                  type="button"
                  className={`planner-rail-cell ${slot.state} ${active ? "active" : ""}`}
                  disabled={slot.state !== "open"}
                  onClick={() => {
                    handleTimeSelection(slot.time);
                    onPickSlot?.(slot.time);
                  }}
                >
                  <span>{formatTime(slot.time)}</span>
                  <strong>{slot.reason}</strong>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TimesSection;
