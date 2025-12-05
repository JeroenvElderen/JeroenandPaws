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
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Tailored",
          label: s.duration_minutes
            ? `${s.duration_minutes / 60}-Hour Stay`
            : "Flexible Schedule",
          duration: s.duration_minutes
            ? `${s.duration_minutes / 60}-Hour Stay`
            : "Custom Schedule",
          durationMinutes: s.duration_minutes || null,
          ctaText: s.price ? "Check availability" : "Plan tailored care",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
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
