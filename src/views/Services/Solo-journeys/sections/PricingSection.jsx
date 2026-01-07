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
        (data.services || []).map((service) => ({
          id: service.slug,
          title: service.title,
          description: service.description || "",
          price: service.price || "Tailored",
          label: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Journey`
            : "Flexible Hours",
          duration: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Journey`
            : "Custom Journey",
          durationMinutes: service.duration_minutes || null,
          allowRecurring: service.allow_recurring ?? true,
          ctaText: service.price ? "Check availability" : "Plan a solo journey",
          ...(service.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${service.slug}`,
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
    <section id="services">
    <DynamicPricingSection
      title="Solo Journey Plans"
      services={services}
      gridClassName="grid_3-col"
      defaultCta="Check availability"
    />
    </section>
  );
};

export default SoloJourneyPricingSection;
