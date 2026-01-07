import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const PricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Training`);
      const data = await res.json();

      setServices(
        (data.services || []).map((service) => ({
          id: service.slug,
          title: service.title,
          description: service.description || "",
          price: service.price || "Tailored",
          label: service.duration_minutes
            ? `${service.duration_minutes}-Min Session`
            : "Flexible Duration",
          duration: service.duration_minutes
            ? `${service.duration_minutes}-Min Session`
            : "Custom Plan",
          durationMinutes: service.duration_minutes || null,
          allowRecurring: service.allow_recurring ?? true,
          ctaText: service.price ? "Check availability" : "Plan a tailored session",
          ...(service.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${service.slug}`,
              heading: "How should we plan your tailored session?",
              description: "WhatsApp or submit a detailed request.",
            },
          }),
        }))
      );
    }

    load();
  }, []);

  return (
    <section id="services">
    <DynamicPricingSection
      title="Training Help — Session Options"
      services={services}
      gridClassName="grid_4-col"
      defaultCta="Check availability"
    />
    </section>
  );
};

export default PricingSection;
