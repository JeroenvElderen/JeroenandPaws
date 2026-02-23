import React, { memo, useMemo, useRef, useState } from "react";

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
  selectedTime,
  onSlotSelect,
  disablePastDates = true,
}) => {
  const [viewMode, setViewMode] = useState("week");
  const touchStartX = useRef(null);

  const timelineHours = useMemo(
    () => Array.from({ length: 13 }, (_, idx) => 8 + idx),
    []
  );

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return new Date(visibleMonth);
    return new Date(`${selectedDate}T00:00:00`);
  }, [selectedDate, visibleMonth]);

  const plannerDates = useMemo(() => {
    if (viewMode === "day") {
      const iso = `${selectedDateObj.getFullYear()}-${String(
        selectedDateObj.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDateObj.getDate()).padStart(2, "0")}`;
      return [iso];
    }

    const monday = new Date(selectedDateObj);
    const weekday = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - weekday);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(day.getDate()).padStart(2, "0")}`;
    });
  }, [selectedDateObj, viewMode]);

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
          <div className="toggle-group" role="tablist" aria-label="Calendar view mode">
            {[
              { id: "day", label: "Day" },
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`ghost-button tiny ${viewMode === mode.id ? "is-active" : ""}`}
                aria-pressed={viewMode === mode.id}
                onClick={() => setViewMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
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
      <p className="muted subtle">Planner starts in week view so clients can immediately see Open vs Booked blocks.</p>
      {loading ? (
        <p className="muted">Loading availability…</p>
      ) : (
        <>
          {viewMode === "month" ? (
            <>
              <div className="weekday-row">
                {weekdayLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="calendar-grid" aria-label="Calendar">
                {monthMatrix.map((dateObj, index) => {
              const iso = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(
                dateObj.getDate()
              ).padStart(2, "0")}`;
              const dayData = availabilityMap[iso];
              const isAvailable = isDayAvailableForService(dayData);
              const isSelected = iso === selectedDate;
              const isScheduled = Boolean(selectedSlots[iso]);
              const isPastDate =
                disablePastDates &&
                dateObj < new Date().setHours(0, 0, 0, 0);
              const isFirstDay = index === 0;
              const gridColumnStart = isFirstDay
                ? ((dateObj.getDay() + 6) % 7) + 1
                : undefined;
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
                      style={{ gridColumnStart }}
                    >
                      <span>{dateObj.getDate()}</span>
                      <span className="day-dot-wrapper">
                        {isAvailable && <span className="day-dot" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="planner-grid" aria-label={`${viewMode} planner`}>
              <div className="planner-grid__header">
                <span />
                {plannerDates.map((isoDate) => (
                  <button
                    key={isoDate}
                    type="button"
                    className={`planner-day-label ${selectedDate === isoDate ? "active" : ""}`}
                    onClick={() => handleDaySelection(isoDate)}
                  >
                    {new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </button>
                ))}
              </div>
              {timelineHours.map((hour) => {
                const hourLabel = `${String(hour).padStart(2, "0")}:00`;
                return (
                  <div className="planner-row" key={`hour-${hour}`}>
                    <span className="planner-hour">{hourLabel}</span>
                    {plannerDates.map((isoDate) => {
                      const dayData = availabilityMap[isoDate];
                      const slot = dayData?.slots?.find(
                        (candidate) => Number(candidate.time?.split(":")?.[0]) === hour
                      );
                      const isAvailable = Boolean(slot?.available);
                      const isActiveSlot =
                        selectedDate === isoDate && selectedTime === slot?.time;
                      return (
                        <button
                          key={`${isoDate}-${hour}`}
                          type="button"
                          className={`planner-cell ${isAvailable ? "open" : "booked"} ${isActiveSlot ? "active" : ""}`}
                          onClick={() => {
                            handleDaySelection(isoDate);
                            if (isAvailable && slot?.time && onSlotSelect) {
                              onSlotSelect(isoDate, slot.time);
                            }
                          }}
                        >
                          <span>{isAvailable ? "Open" : "Booked"}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(CalendarSection);
