import React, { useEffect, useState } from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceBooking from "../../../components/Pricing/useServiceBooking";
import { getPreferredChatUrl } from "../../../utils/chatLinks";

const DaytimeCare = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose a daytime care plan",
    chooserDescription: "Select the schedule that fits your companion before booking.",
  });

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
    <>
      <FeatureSection onBook={openBooking}/>
      <AboutSection />
      <PricingSection />
      <FaqSection />
      <TestimonialsSection />
      {bookingOverlays}
    </>
  );
};

export default DaytimeCare;
