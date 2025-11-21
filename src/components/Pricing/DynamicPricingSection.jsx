import Link from "next/link";
import React, { useState } from "react";
import BookingModal from "./BookingModal";
import ChatOrFormModal from "./ChatOrFormModal";
import PricingStyles from "./PricingStyles";

const DynamicPricingSection = ({
  title = "Walking Plans for Every Pup",
  services = [],
  gridClassName = "grid_4-col",
  defaultCta = "Check availability",
}) => {
  const [activeService, setActiveService] = useState(null);
  const [ctaChoiceService, setCtaChoiceService] = useState(null);

  const handleSelect = (service) => {
    if (service.ctaOptions) {
      setCtaChoiceService(service);
      return;
    }
    if (service.ctaHref) return;
    setActiveService(service);
  };

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">{title}</h1>
        </div>

        <ul className={`${gridClassName} gap-xsmall text-align_center w-list-unstyled`}>
          {services.map((service) => (
            <li key={service.id} className="card on-secondary">
              <div className="card_body is-small">
                <div className="margin_bottom-auto">
                  <h4>{service.title}</h4>
                  {service.label && <div className="eyebrow">{service.label}</div>}
                  {service.price && <p className="heading_h3">{service.price}</p>}
                  {service.description && <p>{service.description}</p>}
                </div>
                <div className="button-group is-align-center">
                  {service.ctaHref ? (
                    <Link className="button w-button" href={service.ctaHref}>
                      {service.ctaText || defaultCta}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="button w-button"
                      onClick={() => handleSelect(service)}
                    >
                      {service.ctaText || defaultCta}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeService && !activeService.ctaHref && (
        <BookingModal
          service={activeService}
          onClose={() => setActiveService(null)}
        />
      )}
      {ctaChoiceService?.ctaOptions && (
        <ChatOrFormModal
          service={ctaChoiceService}
          onClose={() => setCtaChoiceService(null)}
        />
      )}
      <PricingStyles />
    </section>
  );
};

export default DynamicPricingSection;