import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";

const services = [
  {
    id: "overnight-stay-standard",
    title: "Cozy Overnight Stay",
    label: "Boarding — 24 hrs",
    price: "€45/night",
    description:
      "Safe and loving overnight care in my home — daily walks, playtime, and cozy rest alongside my two friendly pups.",
    duration: "Overnight Stay",
    durationMinutes: 24 * 60,
    ctaText: "Book Boarding",
  },
  {
    id: "overnight-stay-custom",
    title: "Your Dog’s Perfect Stay",
    label: "Custom duration",
    price: "Tailored",
    description:
      "Need extra nights or special care? We’ll create a plan that fits your schedule and your dog’s needs.",
    duration: "Custom Duration",
    durationMinutes: null,
    ctaText: "Plan Your Stay",
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Boarding Rates"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;