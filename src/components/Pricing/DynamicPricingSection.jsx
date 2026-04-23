import Link from "next/link";
import React, { useState } from "react";
import ChatOrFormModal from "./ChatOrFormModal";
import PricingStyles from "./PricingStyles";

const normalizeCtaLabel = (label = "") => {
  if (!label) return "Send request";
  if (/check availability/i.test(label)) return "Send request";
  if (/^book\b/i.test(label)) return label.replace(/^book/i, "Request");
  return label;
};

const toKebabCase = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const DynamicPricingSection = ({
  title = "Walking Plans for Every Pup",
  services = [],
  gridClassName = "grid_4-col",
  defaultCta = "Send request",
}) => {
  const [ctaChoiceService, setCtaChoiceService] = useState(null);

  const getCtaLabel = (service) => {
    if (service.ctaText) return normalizeCtaLabel(service.ctaText);
    if (service.duration) return `Request ${service.duration}`;
    if (service.title) return `Request ${service.title}`;
    return defaultCta;
  };

  const buildRequestService = (service = {}) => {
    const serviceKey = service.id || service.slug || toKebabCase(service.title) || "custom-request";
    return {
      ...service,
      ctaOptions: {
        chatUrl: service.ctaOptions?.chatUrl,
        formUrl: service.ctaOptions?.formUrl || `/contact?service=${serviceKey}`,
        heading: service.ctaOptions?.heading || `How would you like to request ${service.title || "this service"}?`,
        description:
          service.ctaOptions?.description ||
          "Message us on WhatsApp or send the request form and we will follow up directly.",
      },
    };
  };

  const handleSelect = (service) => {
    if (service.ctaHref) return;
    setCtaChoiceService(buildRequestService(service));
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
                      {getCtaLabel(service)}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="button w-button"
                      onClick={() => handleSelect(service)}
                    >
                      {getCtaLabel(service)}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

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
