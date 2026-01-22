import React, { useEffect, useState } from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceBooking from "../../../components/Pricing/useServiceBooking";
import { getPreferredChatUrl } from "../../../utils/chatLinks";
import book from "api/book";
import StickyBookingCta from "../../../components/StickyBookingCta";

const HomeCheckins = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose your check-in",
    chooserDescription: "Select a visit length before you continue to booking.",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/services?category=Home Visits`);
      const data = await res.json();

      setServices(
        (data.services || []).map((service) => ({
          id: service.slug,
          title: service.title,
          description: service.description || "",
          category: service.category || "Home Visits",
          price: service.price || "Tailored",
          label: service.duration_minutes
            ? `${service.duration_minutes}-Min Visit`
            : "Flexible Timing",
          duration: service.duration_minutes
            ? `${service.duration_minutes}-Min Visit`
            : "Custom Plan",
          durationMinutes: service.duration_minutes || null,
          allowRecurring: service.allow_recurring ?? true,
          allowMultiDay: service.allow_multi_day ?? true,
          ctaText: service.price ? "Check availability" : "Plan a custom check-in",
          ...(service.price === null && {
            ctaOptions: {
              chatUrl: getPreferredChatUrl(),
              formUrl: `/contact?service=${service.slug}`,
              heading: "How would you like to plan your custom check-in?",
              description: "Share timings or special instructions.",
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
       <StickyBookingCta label="Book a home check-in" onClick={openBooking} />
      {bookingOverlays}
    </>
  );
};

export default HomeCheckins;
