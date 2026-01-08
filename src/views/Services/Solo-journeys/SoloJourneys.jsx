import React, { useEffect, useState } from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceBooking from "../../../components/Pricing/useServiceBooking.js";
import { getPreferredChatUrl } from "../../../utils/chatLinks";

const SoloJourneys = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose your solo journey",
    chooserDescription: "Select the outing you want before scheduling.",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Solo Journeys`);
      const data = await res.json();

      setServices(
        (data.services || []).map((service) => ({
          id: service.slug,
          title: service.title,
          description: service.description || "",
          price: service.price || "Tailored",
          label: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Journey`
            : "Flexible Hours",
          duration: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Journey`
            : "Custom Journey",
          durationMinutes: service.duration_minutes || null,
          allowRecurring: service.allow_recurring ?? true,
          allowMultiDay: service.allow_multi_day ?? true,
          ctaText: service.price ? "Check availability" : "Plan a solo journey",
          ...(service.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${service.slug}`,
              heading: "How should we plan your custom stay?",
              description: "WhatsApp to discuss dates or request form.",
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

export default SoloJourneys;
