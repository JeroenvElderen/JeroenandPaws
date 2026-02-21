import React from "react";

const PriceSummaryCard = ({ pricing, formatCurrency, parsePriceValue }) => {
  return (
    <div className="price-summary-card inline-price-summary">
      <div className="price-summary__header">
        <div>
          <p className="muted small">Current total</p>
          <h4>{formatCurrency(pricing.totalPrice)}</h4>
        </div>
        <p className="muted subtle price-summary__meta">
          {pricing.dogCount && pricing.visitCount
            ? `${pricing.dogCount} dog${
                pricing.dogCount > 1 ? "s" : ""
              } × ${pricing.visitCount} visit${
                pricing.visitCount > 1 ? "s" : ""
              }`
            : "Add dogs and pick dates"}
        </p>
      </div>
      <ul className="price-summary__list">
        <li>
          Service: {formatCurrency(pricing.servicePrice)} per dog / visit
        </li>
        {pricing.dogCount >= 2 && (
          <li>
            Second dog: {formatCurrency(pricing.secondDogPrice)} (save{" "}
            {formatCurrency(pricing.secondDogDiscount)})
          </li>
        )}
        {pricing.dogCount >= 3 && (
          <li>
            Third dog: {formatCurrency(pricing.thirdDogPrice)} (save{" "}
            {formatCurrency(pricing.thirdDogDiscount)})
          </li>
        )}
        {pricing.durationMultiplier && pricing.durationMultiplier !== 1 && (
          <li>
            Duration adjustment: ×{pricing.durationMultiplier.toFixed(2)}
          </li>
        )}
        {pricing.selectedAddons.map((addon) => (
          <li key={addon.id || addon.value}>
            + {addon.label}: {formatCurrency(parsePriceValue(addon.price))}
          </li>
        ))}
        <li>
          Travel cost: {formatCurrency(pricing.travelSurcharge)}{" "}
          {pricing.travelSurcharge > 0 ? (
            <>
              ({pricing.travelSurchargeKm} km over{" "}
              {pricing.travelSurchargeThreshold} km
              {pricing.visitCount > 1
                ? ` × ${pricing.visitCount} visits`
                : ""}
              )
            </>
          ) : (
            <>({pricing.travelSurchargeThreshold} km included)</>
          )}
        </li>
        <li>
          Total per visit (all dogs): {formatCurrency(pricing.perVisitTotal)}
        </li>
        <li>Total per dog / visit: {formatCurrency(pricing.servicePrice)}</li>
      </ul>
    </div>
  );
};

export default PriceSummaryCard;
