import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const PricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      console.log("🟢 CLIENT: Fetching Custom Care services...");

      const res = await fetch(`/api/services?category=Custom Care`);
      const data = await res.json();

      console.log("🟢 CLIENT: Raw services:", data.services);

      const mapped = (data.services || []).map((s) => ({
        id: s.slug,
        title: s.title,
        description: s.description || "",
        price: s.price || "Custom Quote",
        label: s.duration_minutes ? "Multi-Session" : "Tailored Care",
        duration: s.duration_minutes ? "Multi-Session" : "Custom Plan",
        durationMinutes: s.duration_minutes || null,
        ctaText: "Check availability",

        // Custom-care services always use ctaOptions
        ctaOptions: {
          chatUrl: getPreferredChatUrl(),
          formUrl: `/contact?service=${s.slug}`,
          heading: `Tell me more about "${s.title}"`,
          description:
            "Start a chat for quick questions, or send a detailed request through the form.",
        },
      }));

      console.log("🟢 CLIENT: Converted services:", mapped);
      setServices(mapped);
    }

    load();
  }, []);

  return (
    <section id="services">
    <DynamicPricingSection
      title="Tailored solutions for every dog"
      services={services}
      gridClassName="grid_4-col"
      defaultCta="Check availability"
    />
    </section>
  );
};

export default PricingSection;
