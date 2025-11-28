import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const SoloJourneyPricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Solo Journeys`);
      const data = await res.json();

      setServices(
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Tailored",
          label: s.duration_minutes
            ? `${s.duration_minutes / 60}-Hour Journey`
            : "Flexible Hours",
          duration: s.duration_minutes
            ? `${s.duration_minutes / 60}-Hour Journey`
            : "Custom Journey",
          durationMinutes: s.duration_minutes || null,
          ctaText: s.price ? "Check availability" : "Plan a solo journey",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
              heading: "How should we plan your custom stay?",
              description: "WhatsApp to discuss dates or request form.",
            },
          }),
        }))
      );
    }

    load();
  }, []);

  return (
    <DynamicPricingSection
      title="Solo Journey Plans"
      services={services}
      gridClassName="grid_3-col"
      defaultCta="Check availability"
    />
  );
};

export default SoloJourneyPricingSection;
