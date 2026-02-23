import React from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const OvernightStays = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "overnight-stays",
    title: "Overnight stays",
    formUrl: "/contact?service=overnight-stays",
    heading: "Plan an overnight stay",
    description: "Chat with us directly or submit your stay details with the form.",
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

export default OvernightStays;
