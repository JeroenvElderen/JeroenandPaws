import React from "react";

const BookingWayfinding = ({
  stepOrder,
  currentStep,
  onStepSelect,
  summaryChips,
}) => {
  return (
    <div className="booking-wayfinding">
      <div className="step-chip-row">
        {stepOrder.map((step) => {
          const stepIndex = stepOrder.indexOf(step);
          const activeIndex = stepOrder.indexOf(currentStep);
          const isActive = currentStep === step;
          const isComplete = stepIndex < activeIndex;
          return (
            <button
              key={step}
              type="button"
              className={`step-chip ${isActive ? "active" : ""} ${
                isComplete ? "complete" : ""
              }`}
              onClick={() => onStepSelect(step)}
            >
              <span className="step-icon">
                {isComplete ? "✓" : stepIndex + 1}
              </span>
            </button>
          );
        })}
      </div>
      <div className="wayfinding-summary">
        {summaryChips.map((chip, index) => (
          <span key={index} className="summary-chip">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BookingWayfinding;
