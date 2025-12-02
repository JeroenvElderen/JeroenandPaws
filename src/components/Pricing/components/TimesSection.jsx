import React from "react";

const TimesSection = ({
  selectedDay,
  isDayAvailableForService,
  selectedDateLabel,
  selectedTime,
  handleTimeSelection,
  formatTime,
  onContinue,
  onBack,
  canContinue,
  timesSectionRef,
}) => {
  return (
    <div className="times-card" ref={timesSectionRef}>
      <div className="times-header">
        <div>
          <p className="muted small">{selectedDateLabel}</p>
          <h4>Available slots</h4>
        </div>
        <div className="times-actions">
          <p className="muted subtle">
            {selectedTime ? formatTime(selectedTime) : "Choose a time"}
          </p>
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
              className="button w-button"
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

        {selectedDay &&
          isDayAvailableForService(selectedDay) &&
          selectedDay.slots
            ?.filter((slot) => slot.available)
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
        <p className="muted subtle">Times shown in your timezone</p>
      </div>
    </div>
  );
};

export default TimesSection;