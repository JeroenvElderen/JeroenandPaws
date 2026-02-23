import React from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const HomeCheckins = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "home-checkins",
    title: "Home check-ins",
    formUrl: "/contact?service=home-checkins",
    heading: "Plan your home check-in",
    description: "Share timing and care details through WhatsApp or the request form.",
  });

  return (
    <>
      <FeatureSection onBook={openCtaModal} />
      <AboutSection />
      <PricingSection />
      <FaqSection />
      <TestimonialsSection />
      {ctaModal}
    </>
  );
};

export default HomeCheckins;
