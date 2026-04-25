const BookingSummary = ({ selectedDateLabel, selectedTime, pricing, formatCurrency }) => {
  if (!selectedDateLabel && !selectedTime && pricing.totalPrice === 0) return null;

  return (
    <div className="booking-summary">
      {selectedDateLabel && <div className="summary-row">{selectedDateLabel}</div>}
      {selectedTime && <div className="summary-row">{selectedTime}</div>}
      {pricing.dogCount > 0 && (
        <div className="summary-row">
          {pricing.dogCount} dog{pricing.dogCount > 1 ? "s" : ""}
        </div>
      )}
      {pricing.totalPrice > 0 && (
        <div className="summary-row price">
          {formatCurrency(pricing.totalPrice)}
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
