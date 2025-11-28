import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const PricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Overnight Support`);
      const data = await res.json();

      setServices(
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Tailored",
          label: s.duration_minutes === 1440 ? "Boarding — 24 hrs" : "Custom duration",
          duration: s.duration_minutes === 1440 ? "Overnight Stay" : "Custom Duration",
          durationMinutes: s.duration_minutes || null,
          allowRecurring: false,
          allowMultiDay: false,
          ctaText: s.price ? "Check availability" : "Plan a tailored stay",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
              heading: "How should we plan your custom stay?",
              description: "Discuss dates via WhatsApp or request form.",
            },
          }),
        }))
      );
    }

    load();
  }, []);

  return (
    <DynamicPricingSection
      title="Overnight Stay Options"
      services={services}
      gridClassName="grid_4-col"
      defaultCta="Check availability"
    />
  );
};

export default PricingSection;
