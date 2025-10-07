import React from "react";
import DailystrollsFaqSection from "./sections/DailystrollsFaqSection";
import DailystrollsFeatureSection from "./sections/DailystrollsFeatureSection";
import DailystrollsPricingSection from "./sections/DailystrollsPricingSection";
import DailystrollsTestimonialsSection from "./sections/DailystrollsTestimonialsSection";
import AboutSection from "./sections/AboutSection";
const Dailystrolls = () => {
  return (
    <>
      <DailystrollsFeatureSection />
      <AboutSection />
      <DailystrollsPricingSection />
      <DailystrollsFaqSection />
      <DailystrollsTestimonialsSection />
    </>
  );
};

export default Dailystrolls;
