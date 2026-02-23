import React from "react";
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import FaqSection from './sections/FaqSection';
import TestimonialsSection from './sections/TestimonialsSection';
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const CustomSolutions = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "custom-solutions",
    title: "Custom solutions",
    formUrl: "/contact?service=custom-solutions",
    heading: "Tell us about your custom care plan",
    description: "Choose WhatsApp for a quick chat or use the request form.",
  });

  return (
    <>
      <FeatureSection onBook={openCtaModal}/>
      <PricingSection />
      <FaqSection />
      <TestimonialsSection />
      {ctaModal}
    </>
  );
};

export default CustomSolutions;
