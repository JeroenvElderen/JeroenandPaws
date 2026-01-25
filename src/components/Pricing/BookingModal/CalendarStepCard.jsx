import React from "react";
import CalendarSection from "../components/CalendarSection";

const CalendarStepCard = ({
  allowMultiDay,
  allowWeeklyRecurring,
  clientEircode,
  onClientEircodeChange,
  isMultiDay,
  onToggleMultiDay,
  travelAnchor,
  previousBookingTime,
  onPreviousBookingTimeChange,
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
  canContinueFromCalendar,
  onContinue,
}) => {
  return (
    <div className="step-card" ref={calendarSectionRef}>
      <div className="selection-summary">
        <div>
          <h4>Visit schedule</h4>
          <p className="muted subtle">
            {allowMultiDay && allowWeeklyRecurring
              ? "Pick a date or toggle multi-day to select multiple days, don't forget to put your Eircode!"
              : "Pick a date to see which time slots are available."}
          </p>
        </div>
        <div className="selection-summary-actions">
          <label className="input-group">
            <span>Your Eircode</span>
            <input
              type="text"
              value={clientEircode}
              onChange={(event) => onClientEircodeChange(event.target.value)}
              placeholder="e.g. A98H940"
            />
          </label>
          {allowMultiDay && allowWeeklyRecurring && (
            <label className={`pill-toggle ${isMultiDay ? "is-active" : ""}`}>
              <input
                type="checkbox"
                checked={isMultiDay}
                onChange={onToggleMultiDay}
              />
              <div>
                <strong>Multi-day weekly</strong>
                <small>Select multiple days in the calendar</small>
              </div>
            </label>
          )}
        </div>
      </div>
      {travelAnchor === "previous" && (
        <div className="form-grid">
          <label className="input-group">
            <span>Previous booking ends at</span>
            <input
              type="time"
              value={previousBookingTime}
              onChange={(event) =>
                onPreviousBookingTimeChange(event.target.value)
              }
            />
          </label>
        </div>
      )}
      <CalendarSection
        availabilityNotice={availabilityNotice}
        loading={loading}
        monthLabel={monthLabel}
        weekdayLabels={weekdayLabels}
        monthMatrix={monthMatrix}
        visibleMonth={visibleMonth}
        availabilityMap={availabilityMap}
        isDayAvailableForService={isDayAvailableForService}
        selectedDate={selectedDate}
        selectedSlots={selectedSlots}
        handleDaySelection={handleDaySelection}
        calendarSectionRef={calendarSectionRef}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
      />
      {isMultiDay && (
        <div className="calendar-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={onContinue}
            disabled={!canContinueFromCalendar}
          >
            Continue to times
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarStepCard;
