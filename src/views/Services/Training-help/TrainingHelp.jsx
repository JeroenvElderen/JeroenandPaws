import React from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const TrainingHelp = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "training-help",
    title: "Training help",
    formUrl: "/contact?service=training-help",
    heading: "Plan a training session",
    description: "Share your training goals through WhatsApp or the form.",
  });

  return (
    <>
      <FeatureSection onBook={openCtaModal} />
      <PricingSection />
      <FaqSection />
      <TestimonialsSection />
      {ctaModal}
    </>
  );
};

export default TrainingHelp;
