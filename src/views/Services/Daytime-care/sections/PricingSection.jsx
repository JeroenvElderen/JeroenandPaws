import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const PricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Daytime Care`);
      const data = await res.json();

      setServices(
        (data.services || []).map((service) => ({
          id: service.slug,
          title: service.title,
          description: service.description || "",
          price: service.price || "Tailored",
          label: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Stay`
            : "Flexible Schedule",
          duration: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Stay`
            : "Custom Schedule",
          durationMinutes: service.duration_minutes || null,
          allowRecurring: service.allow_recurring ?? true,
          ctaText: service.price ? "Check availability" : "Plan tailored care",
          ...(service.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${service.slug}`,
              heading: "How would you like to plan tailored daytime care?",
              description: "WhatsApp or submit a request form.",
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
      title="Daytime care plans for every companion"
      services={services}
      gridClassName="grid_3-col"
      defaultCta="Check availability"
    />
    </section>
  );
};

export default PricingSection;
