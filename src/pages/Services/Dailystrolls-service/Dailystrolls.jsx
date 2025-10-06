import React from "react";
import DailystrollsFaqSection from "./sections/DailystrollsFaqSection";
import DailystrollsFeatureSection from "./sections/DailystrollsFeatureSection";
import DailystrollsPricingSection from "./sections/DailystrollsPricingSection";
import DailystrollsTestimonialsSection from "./sections/DailystrollsTestimonialsSection";

const Dailystrolls = () => {
  return (
    <>
      <DailystrollsFeatureSection />
      <DailystrollsPricingSection />
      <DailystrollsFaqSection />
      <DailystrollsTestimonialsSection />
    </>
  );
};

export default Dailystrolls;
