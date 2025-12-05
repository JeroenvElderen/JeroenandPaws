import React, { useEffect, useState } from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import useServiceBooking from "../../../components/Pricing/useServiceBooking";
import { getPreferredChatUrl } from "../../../utils/chatLinks";

const TrainingHelp = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose your training session",
    chooserDescription: "Pick the focus you want before scheduling.",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Training`);
      const data = await res.json();

      setServices(
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Tailored",
          label: s.duration_minutes
            ? `${s.duration_minutes}-Min Session`
            : "Flexible Duration",
          duration: s.duration_minutes
            ? `${s.duration_minutes}-Min Session`
            : "Custom Plan",
          durationMinutes: s.duration_minutes || null,
          ctaText: s.price ? "Check availability" : "Plan a tailored session",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
              heading: "How should we plan your tailored session?",
              description: "WhatsApp or submit a detailed request.",
            },
          }),
        }))
      );
    }

    load();
  }, []);

  return (
    <>
      <FeatureSection onBook={openBooking}/>
      <PricingSection />
      <FaqSection />
      <TestimonialsSection />
      {bookingOverlays}
    </>
  );
};

export default TrainingHelp;
