import React, { useRef } from "react";

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
  onPreviousMonth,
  onNextMonth,
}) => {
  const touchStartX = useRef(null);

  const handleWheel = (event) => {
    if (!onPreviousMonth || !onNextMonth) return;

    const { deltaX, deltaY } = event;
    const primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : 0;

    if (primaryDelta > 16) {
      onNextMonth();
    } else if (primaryDelta < -16) {
      onPreviousMonth();
    }
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX || null;
  };

  const handleTouchEnd = (event) => {
    if (!onPreviousMonth || !onNextMonth) return;

    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;

    if (startX == null || endX == null) return;

    const delta = endX - startX;
    const swipeThreshold = 30;

    if (delta > swipeThreshold) {
      onPreviousMonth();
    } else if (delta < -swipeThreshold) {
      onNextMonth();
    }

    touchStartX.current = null;
  };

  return (
    <div
      className="calendar-card"
      ref={calendarSectionRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="calendar-toolbar">
        <h4>{monthLabel}</h4>
        <div className="toolbar-controls">
          <div className="month-nav" aria-label="Change month">
            <button type="button" onClick={onPreviousMonth} aria-label="Previous month">
              ←
            </button>
            <button type="button" onClick={onNextMonth} aria-label="Next month">
              →
            </button>
          </div>
        </div>
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
                    isAvailable ? "day-has-slots" : "day-no-slots"
                  }`}
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