import React from "react";

const BookingErrorBanner = ({ message, onPickTime, onSupport }) => {
  return (
    <div className="error-banner actionable">
      <div>
        <p>{message}</p>
        <p className="muted subtle">
          Try another time or message us for concierge scheduling.
        </p>
      </div>
      <div className="actions-stack">
        <button type="button" className="ghost-button" onClick={onPickTime}>
          Pick another time
        </button>
        <button type="button" className="ghost-button" onClick={onSupport}>
          Message us
        </button>
      </div>
    </div>
  );
};

export default BookingErrorBanner;
