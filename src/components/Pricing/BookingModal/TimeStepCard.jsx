import React, { useMemo } from "react";
import TimesSection from "../components/TimesSection";

const toIso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const TimeStepCard = ({
  selectedDay,
  selectedDate,
  availabilityMap,
  onDaySelection,
  isDayAvailableForService,
  selectedTime,
  onTimeSelection,
  selectedSlotReachable,
  formatTime,
  onContinue,
  onBack,
  canContinue,
  timesSectionRef,
  hiddenSlotCount,
  travelMinutes,
  travelAnchor,
  isTravelValidationPending,
  travelNote,
  selectedEndTime,
  onEndTimeChange,
  durationMinutes,
  onDurationChange,
  minDurationMinutes,
  category,
  onCategoryChange,
  onPickSlot,
}) => {
  const weekDays = useMemo(() => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    const day = base.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const iso = toIso(d);
      const dayData = availabilityMap?.[iso];
      const slots = (dayData?.slots || []).filter((slot) => slot.available).slice(0, 4);
      return {
        iso,
        label: d.toLocaleDateString("en-IE", { weekday: "short" }),
        dayNumber: d.getDate(),
        slots,
      };
    });
  }, [availabilityMap, isDayAvailableForService, selectedDate]);

  return (
    <div className="step-card" ref={timesSectionRef}>
      <div className="outlook-week-board">
        <div className="outlook-week-board__header">
          <h4>Outlook-style weekly calendar</h4>
          <p className="muted subtle">Pick a day column and tap a slot to schedule.</p>
        </div>

        <div className="outlook-week-grid" role="list" aria-label="Weekly booking slots">
          {weekDays.map((day) => (
            <section
              key={day.iso}
              role="listitem"
              className={`outlook-day-column ${selectedDate === day.iso ? "is-selected" : ""}`}
            >
              <button
                type="button"
                className="outlook-day-head"
                onClick={() => onDaySelection(day.iso)}
              >
                <span>{day.label}</span>
                <strong>{day.dayNumber}</strong>
              </button>

              <div className="outlook-slot-list">
                {day.slots.length > 0 ? (
                  day.slots.map((slot) => (
                    <button
                      key={`${day.iso}-${slot.time}`}
                      type="button"
                      className={`outlook-slot ${selectedDate === day.iso && selectedTime === slot.time ? "active" : ""}`}
                      onClick={() => {
                        if (selectedDate !== day.iso) {
                          onDaySelection(day.iso);
                        }
                        onTimeSelection(slot.time);
                      }}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))
                ) : (
                  <p className="muted subtle">No slots</p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <TimesSection
        selectedDay={selectedDay}
        isDayAvailableForService={isDayAvailableForService}
        selectedTime={selectedTime}
        handleTimeSelection={onTimeSelection}
        selectedSlotReachable={selectedSlotReachable}
        formatTime={formatTime}
        onContinue={onContinue}
        onBack={onBack}
        canContinue={canContinue}
        timesSectionRef={timesSectionRef}
        hiddenSlotCount={hiddenSlotCount}
        travelMinutes={travelMinutes}
        travelAnchor={travelAnchor}
        isTravelValidationPending={isTravelValidationPending}
        travelNote={travelNote}
        selectedEndTime={selectedEndTime}
        onEndTimeChange={onEndTimeChange}
        durationMinutes={durationMinutes}
        onDurationChange={onDurationChange}
        minDurationMinutes={minDurationMinutes}
        category={category}
        onCategoryChange={onCategoryChange}
        onPickSlot={onPickSlot}
      />
    </div>
  );
};

export default TimeStepCard;
