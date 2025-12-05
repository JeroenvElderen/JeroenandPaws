import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const PricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Home Visits`);
      const data = await res.json();

      setServices(
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Tailored",
          label: s.duration_minutes
            ? `${s.duration_minutes}-Min Visit`
            : "Flexible Timing",
          duration: s.duration_minutes
            ? `${s.duration_minutes}-Min Visit`
            : "Custom Plan",
          durationMinutes: s.duration_minutes || null,
          ctaText: s.price ? "Check availability" : "Plan a custom check-in",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
              heading: "How would you like to plan your custom check-in?",
              description: "Share timings or special instructions.",
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
      title="Home Check-Ins — Flexible Care at Home"
      services={services}
      gridClassName="grid_3-col"
      defaultCta="Check availability"
    />
    </section>
  );
};

export default PricingSection;
