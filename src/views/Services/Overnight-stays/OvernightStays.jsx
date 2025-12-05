import React, { useEffect, useState } from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceBooking from "../../../components/Pricing/useServiceBooking";
import { getPreferredChatUrl } from "../../../utils/chatLinks";

const OvernightStays = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose your overnight option",
    chooserDescription: "Select the stay that fits your dates before booking.",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Overnight Support`);
      const data = await res.json();

      setServices(
        (data.services || []).map((s) => ({
          id: s.slug,
          title: s.title,
          description: s.description || "",
          price: s.price || "Tailored",
          label: s.duration_minutes === 1440 ? "Boarding — 24 hrs" : "Custom duration",
          duration: s.duration_minutes === 1440 ? "Overnight Stay" : "Custom Duration",
          durationMinutes: s.duration_minutes || null,
          allowRecurring: false,
          allowMultiDay: false,
          ctaText: s.price ? "Check availability" : "Plan a tailored stay",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${s.slug}`,
              heading: "How should we plan your custom stay?",
              description: "Discuss dates via WhatsApp or request form.",
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

export default OvernightStays;
