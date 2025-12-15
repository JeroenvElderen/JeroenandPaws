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
}) => {
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
              Continue
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

        {hiddenSlotCount > 0 && (
          <p className="muted subtle">
            {hiddenSlotCount} slot{hiddenSlotCount === 1 ? "" : "s"} hidden because we need about {travelMinutes}
            minutes of travel time from {" "}
            {travelAnchor === "previous" ? "your earlier booking" : "home base"}.
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
                  onClick={() => handleTimeSelection(slot.time)}
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
        <p className="muted subtle">Times shown in Ireland (Europe/Dublin)</p>
      </div>
    </div>
  );
};

export default TimesSection;