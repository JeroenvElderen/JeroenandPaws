import React from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const DaytimeCare = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "daytime-care",
    title: "Daytime care",
    formUrl: "/contact?service=daytime-care",
    heading: "How would you like to plan daytime care?",
    description: "Chat on WhatsApp or use the form to tell us your preferred schedule.",
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

export default DaytimeCare;
