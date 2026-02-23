import React from "react";

const BookingHeader = ({
  service,
  onSupport,
  onClose,
  totalPrice = 0,
  bookingTitle = "",
}) => {
  return (
    <header className="booking-hero">
      <div>
        <p className="eyebrow">Nieuwe gebeurtenis</p>
        <h3>{bookingTitle || service.title}</h3>
        <p className="muted">
          {service.duration || "Premium care"} · Jeroen van Elderen
        </p>
      </div>
      <div className="hero-actions">
        <div className="header-total" aria-live="polite">
          <span>Total price</span>
          <strong>€{Number(totalPrice || 0).toFixed(2)}</strong>
        </div>
        {/* Outlook link removed: keep in-app booking flow */}
        <button type="button" className="ghost-button" onClick={onSupport}>
          Support
        </button>
        <button
          className="close-button"
          type="button"
          onClick={onClose}
          aria-label="Close booking"
        >
          ×
        </button>
      </div>
    </header>
  );
};

export default BookingHeader;
