import React from "react";
import { getServiceCtaLabel } from "./serviceCtaUtils";

const ServiceChooserModal = ({
  services = [],
  onSelect,
  onClose,
  title = "Choose a service to book",
  description = "Pick the option that best fits your companion to continue to availability.",
  defaultCta = "Check availability",
}) => {
  const hasServices = services.length > 0;

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="service-chooser">
        <header className="service-chooser__header">
          <div>
            <p className="eyebrow">Booking</p>
            <h3>{title}</h3>
            <p className="muted">{description}</p>
          </div>
          <button
            className="close-button"
            type="button"
            aria-label="Close service selection"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="service-chooser__body">
          {hasServices ? (
            <ul className="service-chooser__grid w-list-unstyled">
              {services.map((service) => (
                <li key={service.id} className="card on-secondary service-chooser__card">
                  <div className="card_body is-small">
                    <div className="margin_bottom-auto">
                      <h4>{service.title}</h4>
                      {service.label && <div className="eyebrow">{service.label}</div>}
                      {service.price && <p className="heading_h3">{service.price}</p>}
                      {service.description && <p>{service.description}</p>}
                    </div>
                    <div className="button-group is-align-center">
                      <button
                        type="button"
                        className="button w-button"
                        onClick={() => onSelect?.(service)}
                      >
                        {getServiceCtaLabel(service, defaultCta)}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="service-chooser__empty">
              <p className="eyebrow">Loading services</p>
              <p className="muted">Fetching the latest options. One moment…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceChooserModal;