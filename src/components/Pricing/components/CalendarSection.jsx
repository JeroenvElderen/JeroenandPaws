import React, { forwardRef } from "react";

const CalendarSection = forwardRef(
  (
    {
      loading,
      availabilityNotice,
      monthLabel,
      weekdayLabels,
      monthMatrix,
      visibleMonth,
      onPrevMonth,
      onNextMonth,
      is24h,
      onToggleTimeFormat,
      availabilityMap,
      isDayAvailable,
      selectedDate,
      onDaySelect,
      timeZoneLabel,
    },
    ref
  ) => {
    return (
      <div className="calendar-card" ref={ref}>
        {/* HEADER */}
        <div className="calendar-toolbar">
          <div>
            <p className="muted small">{timeZoneLabel}</p>
            <h4>{monthLabel}</h4>
          </div>

          <div className="toolbar-controls">
            <div className="month-nav">
              <button
                type="button"
                className="nav-button"
                onClick={onPrevMonth}
              >
                ‹
              </button>
              <button
                type="button"
                className="nav-button"
                onClick={onNextMonth}
              >
                ›
              </button>
            </div>

            <div className="toggle-group">
              <button
                type="button"
                className={`pill ${is24h ? "active" : ""}`}
                onClick={() => onToggleTimeFormat(true)}
              >
                24h
              </button>
              <button
                type="button"
                className={`pill ${!is24h ? "active" : ""}`}
                onClick={() => onToggleTimeFormat(false)}
              >
                12h
              </button>
            </div>
          </div>
        </div>

        {/* NOTICE */}
        {availabilityNotice && (
          <p className="info-banner">{availabilityNotice}</p>
        )}

        {/* LOADING */}
        {loading ? (
          <p className="muted">Loading availability…</p>
        ) : (
          <>
            {/* WEEKDAY HEADERS */}
            <div className="weekday-row">
              {weekdayLabels.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="calendar-grid">
              {monthMatrix.map((dateObj) => {
                const iso = dateObj.toISOString().slice(0, 10);
                const inThisMonth =
                  dateObj.getMonth() === visibleMonth.getMonth();

                const dayData = availabilityMap[iso];
                const available = isDayAvailable(dayData);

                const isSelected = iso === selectedDate;
                const isPast = dateObj < new Date().setHours(0, 0, 0, 0);

                return (
                  <button
                    key={iso}
                    type="button"
                    className={[
                      "day",
                      isSelected ? "selected" : "",
                      available ? "available" : "unavailable",
                      inThisMonth ? "" : "muted",
                    ].join(" ")}
                    disabled={isPast || !available}
                    onClick={() => onDaySelect(iso)}
                  >
                    <span>{dateObj.getDate()}</span>
                    <span className="day-dot-wrapper">
                      {available && <span className="day-dot" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }
);

export default CalendarSection;
