import React from "react";

const AddonsForm = ({
  addons,
  additionals,
  toggleAdditional,
  formatCurrency,
  parsePriceValue,
  title = "Service additions",
  description = "Personalize your booking with optional extras from our Supabase catalog.",
}) => {
  if (!addons?.length) {
    return (
      <div className="addon-card">
        <h4>{title}</h4>
        <p className="muted subtle">Loading add-ons…</p>
      </div>
    );
  }

  return (
    <div className="addon-card">
      <div className="addon-card__header">
        <div>
          <p className="muted small">Optional</p>
          <h4>{title}</h4>
        </div>
        <p className="muted subtle addon-card__description">{description}</p>
      </div>
      <div className="addon-list" role="group" aria-label="Service add-ons">
        {addons.map((addon) => {
          const isSelected = additionals.includes(addon.value);
          return (
            <label
              key={addon.value}
              className={`addon-row ${isSelected ? "selected" : ""}`}
            >
              <div className="addon-row__control">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAdditional(addon.value)}
                  aria-label={addon.label}
                />
              </div>
              <div className="addon-row__copy">
                <div className="addon-row__title-row">
                  <span className="addon-row__title">{addon.label}</span>
                  {addon.price !== null && addon.price !== undefined && (
                    <span className="addon-row__price">
                      {formatCurrency(parsePriceValue(addon.price))}
                    </span>
                  )}
                </div>
                {addon.description && (
                  <p className="muted subtle addon-row__description">
                    {addon.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AddonsForm;