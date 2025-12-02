import React, { forwardRef } from "react";

const TimeSection = forwardRef(
  (
    {
      selectedDate,
      selectedDateLabel,
      selectedDay,
      selectedTime,
      onTimeSelect,
      formatTime,
      canContinue,
      onContinue,
    },
    ref
  ) => {
    const availableSlots = selectedDay?.slots?.filter((s) => s.available) || [];

    return (
      <div className="times-card" ref={ref}>
        <div className="times-header">
          <div>
            <p className="muted small">
              {selectedDate ? selectedDateLabel : "Pick a date first"}
            </p>
            <h4>Available slots</h4>
          </div>

          <p className="muted subtle">
            {selectedTime ? formatTime(selectedTime) : "Choose a time"}
          </p>
        </div>

        <div className="times-list">
          {!selectedDate && (
            <p className="muted">Select a date to see available times.</p>
          )}

          {selectedDate &&
            selectedDay &&
            (availableSlots.length > 0 ? (
              availableSlots.map((slot) => {
                const active = selectedTime === slot.time;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onTimeSelect(slot.time)}
                    className={`time-slot ${active ? "active" : ""}`}
                  >
                    <span className="dot" />
                    <span>{formatTime(slot.time)}</span>
                    <span className="time-arrow">→</span>
                  </button>
                );
              })
            ) : (
              <p className="muted">
                No available times on this date. Please select another day.
              </p>
            ))}
        </div>

        <div className="times-continue-footer">
          <button
            className="button w-button primary"
            onClick={onContinue}
            disabled={!canContinue}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }
);

export default TimeSection;
