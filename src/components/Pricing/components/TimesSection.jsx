import React from "react";

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
  hiddenSlotCount = 0,
  travelMinutes = 0,
  travelAnchor = "home",
  isTravelValidationPending = false,
  travelNote,
  continueLabel = "Continue",
  selectedEndTime = "",
  onEndTimeChange,
  minDurationMinutes = 30,
  durationMinutes = 60,
  onDurationChange,
  category = "standard",
  onCategoryChange,
  onPickSlot,
}) => {
  const slotOptions =
    selectedDay?.slots
      ?.filter((slot) => slot.available && (slot.reachable !== false || slot.forceVisible))
      .map((slot) => slot.time) || [];

  return (
    <div className="times-card" ref={timesSectionRef}>
      <div className="times-header">
        <h4>Available slots</h4>
        <div className="times-actions">
          <div className="actions-stack">
            {onBack && (
              <button
                type="button"
                className="ghost-button"
                onClick={onBack}
              >
                Back to calendar
              </button>
            )}
            <button
              type="button"
              className="ghost-button"
              onClick={onContinue}
              disabled={!canContinue}
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>
      <div className="times-list" aria-label="Time options">
        {!selectedDay && <p className="muted">Select a date to see times.</p>}
        
        {selectedDay && !isDayAvailableForService(selectedDay) && (
          <p className="muted">
            No compatible start times are available for this service on this date because of other bookings.
          </p>
        )}

        {isTravelValidationPending && (
          <p className="muted subtle">
            Enter your Eircode to confirm travel time. Your chosen slot will stay selected while we validate it.
            {travelNote ? ` ${travelNote}` : ""}
          </p>
        )}

        {selectedDay &&
          selectedTime &&
          !isTravelValidationPending &&
          !selectedSlotReachable && (
            <p className="muted subtle">
              Your selected time is outside the travel buffer for another booking. Please pick another slot.
            </p>
          )}

        {selectedDay &&
          isDayAvailableForService(selectedDay) &&
          selectedDay.slots
            ?.filter(
              (slot) =>
                slot.available && (slot.reachable !== false || slot.forceVisible)
            )
            .map((slot) => {
              const isActive = selectedTime === slot.time;
              return (
                <button
                  key={`${selectedDay.date}-${slot.time}`}
                  type="button"
                  className={`time-slot ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleTimeSelection(slot.time);
                    if (onPickSlot) onPickSlot(slot.time);
                  }}
                  aria-pressed={isActive}
                >
                  <span className="dot" />
                  <span className="time-slot__label">{formatTime(slot.time)}</span>
                </button>
              );
            })}

        {selectedDay &&
          isDayAvailableForService(selectedDay) &&
          selectedDay.slots.every((slot) => !slot.available) && (
            <p className="muted">All slots are full for this day.</p>
          )}

        {selectedDay && selectedTime && (
          <div className="slot-editor">
            <div className="slot-editor__header">
              <h5>Booking details</h5>
              <p className="muted subtle">Adjust duration and booking label before continuing.</p>
            </div>

            <div className="slot-editor__grid">
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

              <label className="input-group full-width">
                <span>Categorise</span>
                <select
                  className="input-like-select"
                  value={category}
                  onChange={(event) => onCategoryChange?.(event.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="busy">Busy</option>
                  <option value="one-hour-before">1 hour before</option>
                  <option value="follow-up">Follow-up needed</option>
                </select>
              </label>
            </div>
          </div>
        )}
        <p className="muted subtle">Times shown in Ireland (Europe/Dublin)</p>
      </div>
    </div>
  );
};

export default TimesSection;
