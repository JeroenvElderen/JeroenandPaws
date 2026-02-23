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
  onPickSlot,
  totalPrice = 0,
  serviceTitle = "",
}) => {
  const dayStartMinutes = 8 * 60;
  const dayEndMinutes = 22 * 60;
  const minutesToTime = (minutes) => {
    const clampedMinutes = Math.max(
      dayStartMinutes,
      Math.min(dayEndMinutes, minutes),
    );
    const hour = String(Math.floor(clampedMinutes / 60)).padStart(2, "0");
    const minute = String(clampedMinutes % 60).padStart(2, "0");
    return `${hour}:${minute}`;
  };
  const parseTime = (value) => {
    const [hour, minute] = String(value || "")
      .split(":")
      .map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
  };

  const startMinutes = parseTime(selectedTime);
  const endMinutes = parseTime(selectedEndTime);
  const gridStep = 15;
  const stepHeight = 10;
  const totalSteps = (dayEndMinutes - dayStartMinutes) / gridStep;

  const blockTop =
    Number.isFinite(startMinutes) && startMinutes >= dayStartMinutes
      ? ((startMinutes - dayStartMinutes) / gridStep) * stepHeight
      : 0;
  const blockHeight =
    Number.isFinite(startMinutes) &&
    Number.isFinite(endMinutes) &&
    endMinutes > startMinutes
      ? Math.max(
          ((endMinutes - startMinutes) / gridStep) * stepHeight,
          stepHeight * 2,
        )
      : stepHeight * 4;

  const moveSelectionByPixels = (deltaY, mode = "move") => {
    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return;
    const stepsDelta = Math.round(deltaY / stepHeight);
    if (!stepsDelta) return;

    if (mode === "end") {
      const nextEndMinutes = Math.min(
        dayEndMinutes,
        Math.max(
          startMinutes + minDurationMinutes,
          endMinutes + stepsDelta * gridStep,
        ),
      );
      onEndTimeChange?.(minutesToTime(nextEndMinutes));
      return;
    }

    const duration = endMinutes - startMinutes;
    const nextStartMinutes = Math.max(
      dayStartMinutes,
      Math.min(dayEndMinutes - duration, startMinutes + stepsDelta * gridStep),
    );
    handleTimeSelection(minutesToTime(nextStartMinutes));
    onEndTimeChange?.(minutesToTime(nextStartMinutes + duration));
  };

  const onDragStart = (event, mode = "move") => {
    const pointerStart = event.clientY;
    const onMove = (moveEvent) => {
      moveSelectionByPixels(moveEvent.clientY - pointerStart, mode);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const slotOptions =
    selectedDay?.slots
      ?.filter(
        (slot) =>
          slot.available && (slot.reachable !== false || slot.forceVisible),
      )
      .map((slot) => slot.time) || [];

  return (
    <div className="times-card" ref={timesSectionRef}>
      <div className="times-header">
        <h4>Available slots</h4>
        <div className="times-actions">
          <p className="times-total">
            Total: €{Number(totalPrice || 0).toFixed(2)}
          </p>
          <div className="actions-stack">
            {onBack && (
              <button type="button" className="ghost-button" onClick={onBack}>
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
            No compatible start times are available for this service on this
            date because of other bookings.
          </p>
        )}

        {isTravelValidationPending && (
          <p className="muted subtle">
            Enter your Eircode to confirm travel time. Your chosen slot will
            stay selected while we validate it.
            {travelNote ? ` ${travelNote}` : ""}
          </p>
        )}

        {selectedDay &&
          selectedTime &&
          !isTravelValidationPending &&
          !selectedSlotReachable && (
            <p className="muted subtle">
              Your selected time is outside the travel buffer for another
              booking. Please pick another slot.
            </p>
          )}

        {selectedDay &&
          isDayAvailableForService(selectedDay) &&
          selectedDay.slots
            ?.filter(
              (slot) =>
                slot.available &&
                (slot.reachable !== false || slot.forceVisible),
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
                  <span className="time-slot__label">
                    {formatTime(slot.time)}
                  </span>
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
              <h5>{serviceTitle}</h5>
              <p className="muted subtle">
                Drag the green block to adjust time like Outlook.
              </p>
            </div>

            <div className="time-dragger" aria-label="Selected booking slot">
              <div className="time-dragger__labels" aria-hidden="true">
                {Array.from({ length: totalSteps + 1 }).map((_, index) => {
                  const minutes = dayStartMinutes + index * gridStep;
                  if (minutes % 60 !== 0) return null;
                  return <span key={minutes}>{minutesToTime(minutes)}</span>;
                })}
              </div>
              <div className="time-dragger__track" role="presentation">
                {Number.isFinite(startMinutes) &&
                  Number.isFinite(endMinutes) && (
                    <div
                      className="time-dragger__block"
                      style={{
                        top: `${blockTop}px`,
                        height: `${blockHeight}px`,
                      }}
                      onPointerDown={(event) => onDragStart(event, "move")}
                    >
                      <span>
                        {selectedTime} - {selectedEndTime}
                      </span>
                      <button
                        type="button"
                        className="time-dragger__resize"
                        aria-label="Resize booking"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          onDragStart(event, "end");
                        }}
                      />
                    </div>
                  )}
              </div>
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
                  onChange={(event) =>
                    onDurationChange?.(Number(event.target.value))
                  }
                />
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
