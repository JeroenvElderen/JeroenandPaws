import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";

const services = [
  {
    id: "quick-sniff",
    title: "Quick Sniff & Stroll",
    label: "30-Min Walks",
    price: "€7/walk",
    description:
      "Perfect for potty breaks, puppy zoomies, or a little leg stretch between naps.",
    duration: "30 Min Meeting",
    durationMinutes: 30,
  },
  {
    id: "daily-doggie",
    title: "Daily Doggie Adventure",
    label: "60-Min Walks",
    price: "€12/walk",
    description:
      "An hour of tail wags, sniffing every tree, and coming home happily tired.",
    duration: "60 Min Session",
    durationMinutes: 60,
  },
  {
    id: "mega-adventure",
    title: "Mega Adventure Walk",
    label: "120-min walks",
    price: "€22/walk",
    description:
      "Double the time, double the fun — great for big explorers or extra energy days.",
    duration: "2 Hour Adventure",
    durationMinutes: 120,
  },
  {
    id: "custom-walk",
    title: "Your Walk, Your Way",
    label: "Custom walk",
    price: "Tailored",
    description:
      "Need a special route or timing? Let’s make it paw-fect for your pup.",
    duration: "Custom Plan",
    durationMinutes: null,
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Walking Plans for Every Pup"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;