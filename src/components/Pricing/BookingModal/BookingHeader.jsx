import React from "react";

const BookingHeader = ({
  service,
  onSupport,
  onOutlookBooking,
  hasOutlookBookingLink = false,
  onClose,
  totalPrice = 0,
  bookingTitle = "",
}) => {
  return (
    <header className="booking-hero">
      <div>
        <p className="eyebrow">{service.duration || "Premium care"}</p>
        <h3>{bookingTitle || service.title}</h3>
        <p className="muted">Jeroen van Elderen · Jeroen & Paws</p>
      </div>
      <div className="hero-actions">
        <div className="header-total" aria-live="polite">
          <span>Total price</span>
          <strong>€{Number(totalPrice || 0).toFixed(2)}</strong>
        </div>
        {hasOutlookBookingLink ? (
          <button
            type="button"
            className="ghost-button"
            onClick={onOutlookBooking}
          >
            Book in Outlook
          </button>
        ) : (
          <button type="button" className="ghost-button" onClick={onSupport}>
            Support
          </button>
        )}
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
