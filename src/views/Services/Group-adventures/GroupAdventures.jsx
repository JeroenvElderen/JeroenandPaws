import React, { useEffect, useState } from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceBooking from "../../../components/Pricing/useServiceBooking";
import { getPreferredChatUrl } from "../../../utils/chatLinks";

const GroupAdventures = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose your adventure",
    chooserDescription: "Pick the outing that fits your companion before checking availability.",
  });

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
    <>
      <FeatureSection onBook={openBooking}/>
      <AboutSection />
      <PricingSection />
      <FaqSection />
      {bookingOverlays}
    </>
  );
};

export default GroupAdventures;
