import React, { useEffect, useState } from "react";
import DailystrollsFaqSection from "./sections/DailystrollsFaqSection";
import DailystrollsFeatureSection from "./sections/DailystrollsFeatureSection";
import DailystrollsPricingSection from "./sections/DailystrollsPricingSection";
import DailystrollsTestimonialsSection from "./sections/DailystrollsTestimonialsSection";
import AboutSection from "./sections/AboutSection";
import useServiceBooking from "../../../components/Pricing/useServiceBooking";
import { getPreferredChatUrl } from "../../../utils/chatLinks";

const Dailystrolls = () => {
  const [services, setServices] = useState([]);
  const { openBooking, bookingOverlays } = useServiceBooking({
    services,
    defaultCta: "Check availability",
    chooserTitle: "Choose your stroll",
    chooserDescription: "Pick the walk that matches your companion before checking availability.",
  });

  useEffect(() => {
    async function loadServices() {
      const res = await fetch(`/api/services?category=Daily Strolls`);
      const data = await res.json();

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

      setServices(mapped);
    }

    loadServices();
  }, []);

  return (
    <>
      <DailystrollsFeatureSection onBook={openBooking} />
      <AboutSection />
      <DailystrollsPricingSection />
      <DailystrollsFaqSection />
      <DailystrollsTestimonialsSection />
      {bookingOverlays}
    </>
  );
};

export default Dailystrolls;
