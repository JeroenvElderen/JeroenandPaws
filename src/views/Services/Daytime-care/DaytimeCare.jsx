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
        (data.services || []).map((service) => ({
          id: service.slug,
          title: service.title,
          description: service.description || "",
          category: service.category || "Daytime Care",
          price: service.price || "Tailored",
          label: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Stay`
            : "Flexible Schedule",
          duration: service.duration_minutes
            ? `${service.duration_minutes / 60}-Hour Stay`
            : "Custom Schedule",
          durationMinutes: service.duration_minutes || null,
          allowRecurring: service.allow_recurring ?? true,
          allowMultiDay: service.allow_multi_day ?? true,
          ctaText: service.price ? "Check availability" : "Plan tailored care",
          ...(service.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${service.slug}`,
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
