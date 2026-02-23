import React, { useMemo, useState } from "react";
import ChatOrFormModal from "./ChatOrFormModal";

const DynamicPricingSection = ({ title, services = [], gridClassName = "grid_3-col", defaultCta = "Contact us" }) => {
  const [activeServiceId, setActiveServiceId] = useState(null);

  const activeService = useMemo(
    () => services.find((service) => service.id === activeServiceId) || null,
    [activeServiceId, services]
  );

  return (
    <div>
      {title ? <h2>{title}</h2> : null}
      <div className={gridClassName}>
        {services.map((service) => (
          <article key={service.id} className="pricing-card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <p><strong>{service.price}</strong></p>
            <button type="button" onClick={() => setActiveServiceId(service.id)}>
              {service.ctaText || defaultCta}
            </button>
          </article>
        ))}
      </div>

      {activeService ? (
        <ChatOrFormModal
          service={activeService}
          onClose={() => setActiveServiceId(null)}
        />
      ) : null}
    </div>
  );
};

export default DynamicPricingSection;
