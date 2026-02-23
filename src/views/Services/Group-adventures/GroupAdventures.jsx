import React from "react";
import FaqSection from './sections/FaqSection';
import FeatureSection from './sections/FeatureSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from "./sections/AboutSection";
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const GroupAdventures = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "group-adventures",
    title: "Group adventures",
    formUrl: "/contact?service=group-adventures",
    heading: "Join a group adventure",
    description: "Message us or send a form request and we’ll follow up with options.",
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

export default GroupAdventures;
