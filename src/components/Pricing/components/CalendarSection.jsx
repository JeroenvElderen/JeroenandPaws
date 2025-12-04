import React from "react";

const CalendarSection = ({
  availabilityNotice,
  loading,
  monthLabel,
  weekdayLabels,
  monthMatrix,
  visibleMonth,
  availabilityMap,
  isDayAvailableForService,
  selectedDate,
  selectedSlots,
  handleDaySelection,
  calendarSectionRef,
}) => {
  return (
    <div className="calendar-card" ref={calendarSectionRef}>
      <div className="calendar-toolbar">
        <h4>{monthLabel}</h4>
      </div>
      {availabilityNotice && <p className="info-banner">{availabilityNotice}</p>}
      {loading ? (
        <p className="muted">Loading availability…</p>
      ) : (
        <>
          <div className="weekday-row">
            {weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="calendar-grid" aria-label="Calendar">
            {monthMatrix.map((dateObj) => {
              const iso = dateObj.toISOString().slice(0, 10);
              const isCurrentMonth = dateObj.getMonth() === visibleMonth.getMonth();
              const dayData = availabilityMap[iso];
              const isAvailable = isDayAvailableForService(dayData);
              const isSelected = iso === selectedDate;
              const isScheduled = Boolean(selectedSlots[iso]);
              const isPastDate = dateObj < new Date().setHours(0, 0, 0, 0);
              return (
                <button
                  key={iso}
                  type="button"
                  className={`day ${isSelected ? "selected" : ""} ${isScheduled && !isSelected ? "scheduled" : ""} ${
                    isCurrentMonth ? "" : "muted"
                  } ${isAvailable ? "day-has-slots" : "day-no-slots"}`}
                  onClick={() => handleDaySelection(iso)}
                  aria-pressed={isSelected}
                  disabled={isPastDate || !isAvailable}
                >
                  <span>{dateObj.getDate()}</span>
                  <span className="day-dot-wrapper">
                    {isAvailable && <span className="day-dot" />}
                    {isScheduled && !isSelected && <span className="day-check">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarSection;