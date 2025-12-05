import React, { useEffect, useState } from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import useServiceBooking from "../../../components/Pricing/useServiceBooking";
import { getPreferredChatUrl } from "../../../utils/chatLinks";

const CustomSolutions = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose a custom option",
    chooserDescription: "Pick the tailored service you want before chatting or booking.",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Custom Care`);
      const data = await res.json();

      const mapped = (data.services || []).map((s) => ({
        id: s.slug,
        title: s.title,
        description: s.description || "",
        price: s.price || "Custom Quote",
        label: s.duration_minutes ? "Multi-Session" : "Tailored Care",
        duration: s.duration_minutes ? "Multi-Session" : "Custom Plan",
        durationMinutes: s.duration_minutes || null,
        ctaText: "Check availability",
        ctaOptions: {
          chatUrl: getPreferredChatUrl(),
          formUrl: `/contact?service=${s.slug}`,
          heading: `Tell me more about "${s.title}"`,
          description:
            "Start a chat for quick questions, or send a detailed request through the form.",
        },
      }));

      setServices(mapped);
    }

    load();
  }, []);

  return (
    <>
      <FeatureSection onBook={openBooking} />
      <PricingSection />
      <FaqSection />
      <TestimonialsSection />
      {bookingOverlays}
    </>
  );
};

export default CustomSolutions;
