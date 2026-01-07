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

      const mapped = (data.services || []).map((service) => ({
        id: service.slug,
        title: service.title,
        description: service.description || "",
        price: service.price || "Custom Quote",
        label: service.duration_minutes ? "Multi-Session" : "Tailored Care",
        duration: service.duration_minutes ? "Multi-Session" : "Custom Plan",
        durationMinutes: service.duration_minutes || null,
        allowRecurring: service.allow_recurring ?? true,
        allowRecurring: s.allow_recurring ?? true,
        ctaText: "Check availability",

        // Custom-care services always use ctaOptions
        ctaOptions: {
          chatUrl: getPreferredChatUrl(),
          formUrl: `/contact?service=${service.slug}`,
          heading: `Tell me more about "${service.title}"`,
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
