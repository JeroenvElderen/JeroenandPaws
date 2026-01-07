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
        (data.services || []).map((service) => ({
          id: service.slug,
          title: service.title,
          description: service.description || "",
          price: service.price || "Tailored",
          label: service.duration_minutes === 1440 ? "Boarding — 24 hrs" : "Custom duration",
          duration: service.duration_minutes === 1440 ? "Overnight Stay" : "Custom Duration",
          durationMinutes: service.duration_minutes || null,
          allowRecurring: service.allow_recurring ?? true,
          allowMultiDay: false,
          ctaText: service.price ? "Check availability" : "Plan a tailored stay",
          ...(s.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${service.slug}`,
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
