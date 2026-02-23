import React from "react";
import DailystrollsFeatureSection from './sections/DailystrollsFeatureSection';
import DailystrollsPricingSection from './sections/DailystrollsPricingSection';
import DailystrollsFaqSection from './sections/DailystrollsFaqSection';
import DailystrollsTestimonialsSection from './sections/DailystrollsTestimonialsSection';
import AboutSection from './sections/AboutSection';
import useServiceCtaModal from "../../../components/Pricing/useServiceCtaModal";

const Dailystrolls = () => {
  const { openCtaModal, ctaModal } = useServiceCtaModal({
    id: "daily-strolls",
    title: "Daily strolls",
    formUrl: "/contact?service=daily-strolls",
    heading: "Plan your daily strolls",
    description: "Send us your preferred schedule through WhatsApp or our form.",
  });

  return (
    <>
      <DailystrollsFeatureSection onBook={openCtaModal}/>
      <AboutSection />
      <DailystrollsPricingSection />
      <DailystrollsFaqSection />
      <DailystrollsTestimonialsSection />
      {ctaModal}
    </>
  );
};

export default Dailystrolls;
