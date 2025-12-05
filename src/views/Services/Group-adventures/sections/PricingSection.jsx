import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const PricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Group Adventures`);
      const data = await res.json();

      setServices(
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Custom",
          label: s.duration_minutes
            ? `${s.duration_minutes / 60}-Hour Adventure`
            : "Custom Adventure",
          duration: s.duration_minutes
            ? `${s.duration_minutes / 60}-Hour Adventure`
            : "Custom Adventure",
          durationMinutes: s.duration_minutes || null,
          ctaText: s.price ? "Check availability" : "Plan Custom Adventure",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
              heading: "How would you like to plan your custom adventure?",
              description: "Tell us timing, walk frequency or needs.",
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
      title="Group Adventure Plans"
      services={services}
      gridClassName="grid_4-col"
      defaultCta="Check availability"
    />
    </section>
  );
};

export default PricingSection;
