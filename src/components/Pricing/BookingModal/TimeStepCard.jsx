import React from "react";
import TimesSection from "../components/TimesSection";

const TimeStepCard = ({
  selectedDay,
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
  totalPrice,
  serviceTitle,
}) => {
  return (
    <div className="step-card" ref={timesSectionRef}>
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
        totalPrice={totalPrice}
        serviceTitle={serviceTitle}
      />
    </div>
  );
};

export default TimeStepCard;
