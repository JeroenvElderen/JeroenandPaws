import React, { useEffect, useState } from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const DailystrollsPricingSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadServices() {
      console.log("🟢 CLIENT: Fetching Daily Strolls...");

      const res = await fetch(`/api/services?category=Daily Strolls`);
      const data = await res.json();

      console.log("🟢 CLIENT: Raw services:", data.services);

      const mapped = (data.services || []).map((service) => ({
        id: service.slug,
        title: service.title,
        description: service.description || "",
        price: service.price || "Tailored",
        label: service.duration_minutes
          ? `${service.duration_minutes}-Min Visit`
          : "Tailored Visit",
        duration: service.duration_minutes
          ? `${service.duration_minutes}-Min Visit`
          : "Custom Plan",
        durationMinutes: service.duration_minutes || null,
        ctaText:
          service.price === null ? "Build a custom visit" : "Check availability",
        ...(service.price === null && {
          ctaOptions: {
            chatUrl: getPreferredChatUrl(),
            formUrl: `/contact?service=${service.slug}`,
            heading: "How would you like to plan your tailored stroll?",
            description: "Tell us what you have in mind — WhatsApp or form.",
          },
        }),
      }));

      console.log("🟢 CLIENT: Converted services:", mapped);
      setServices(mapped);
    }

    loadServices();
  }, []);

  return (
    <section id="services">
    <DynamicPricingSection
      title="Daily stroll options for every companion"
      services={services}
      gridClassName="grid_3-col"
      defaultCta="Check availability"
    />
    </section>
  );
};

export default DailystrollsPricingSection;
