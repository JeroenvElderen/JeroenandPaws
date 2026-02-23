import React from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const SoloJourneys = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "solo-journeys",
    title: "Solo journeys",
    formUrl: "/contact?service=solo-journeys",
    heading: "Plan your solo journey",
    description: "Tell us preferred days and duration via WhatsApp or our form.",
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

export default SoloJourneys;
