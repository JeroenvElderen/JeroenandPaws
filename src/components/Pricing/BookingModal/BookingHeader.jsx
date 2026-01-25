import React from "react";

const BookingHeader = ({ service, onSupport, onClose }) => {
  return (
    <header className="booking-hero">
      <div>
        <p className="eyebrow">{service.duration || "Premium care"}</p>
        <h3>{service.title}</h3>
        <p className="muted">Jeroen van Elderen · Jeroen & Paws</p>
      </div>
      <div className="hero-actions">
        <button type="button" className="ghost-button" onClick={onSupport}>
          Need help?
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
