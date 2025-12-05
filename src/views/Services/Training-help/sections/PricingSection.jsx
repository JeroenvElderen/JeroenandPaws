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
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Tailored",
          label: s.duration_minutes
            ? `${s.duration_minutes}-Min Session`
            : "Flexible Duration",
          duration: s.duration_minutes
            ? `${s.duration_minutes}-Min Session`
            : "Custom Plan",
          durationMinutes: s.duration_minutes || null,
          ctaText: s.price ? "Check availability" : "Plan a tailored session",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
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
