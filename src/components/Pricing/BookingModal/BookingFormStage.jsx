import React from "react";
import BookingForm from "../components/BookingForm";

const BookingFormStage = ({
  bookingFormProps,
  visibleStage,
  onContinue,
  toolbar,
  containerRef,
}) => {
  return (
    <div className="step-card" ref={containerRef}>
      {toolbar}
      <BookingForm
        {...bookingFormProps}
        visibleStage={visibleStage}
        onContinue={onContinue}
      />
    </div>
  );
};

export default BookingFormStage;
