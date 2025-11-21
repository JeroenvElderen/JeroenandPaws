import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";

const services = [
  {
    id: "group-adventure-120",
    title: "2-Hour Adventure",
    label: "Group Walk",
    price: "€22",
    description:
      "Extended group outing with play, sniffing, and exploration for active dogs.",
    duration: "2 Hours",
    durationMinutes: 120,
    ctaText: "Book 2-Hour Adventure",
  },
  {
    id: "group-adventure-240",
    title: "Half-Day Adventure",
    label: "3–4 Hours",
    price: "€35",
    description:
      "More time for social play, walks, and rest with new furry friends.",
    duration: "Half-Day Adventure",
    durationMinutes: 240,
    ctaText: "Join Half-Day Adventure",
  },
  {
    id: "group-adventure-480",
    title: "Full-Day Adventure",
    label: "6–8 Hours",
    price: "€55",
    description:
      "All-day group fun: multiple walks, play sessions, and supervised downtime.",
    duration: "Full-Day Adventure",
    durationMinutes: 480,
    ctaText: "Book Full-Day Adventure",
  },
  {
    id: "group-adventure-custom",
    title: "Custom Adventure",
    label: "Tailored Group Time",
    price: "Custom",
    description:
      "Want something special? We’ll create a custom group adventure for your pup’s needs.",
    duration: "Custom Adventure",
    durationMinutes: null,
    ctaText: "Plan Custom Adventure",
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Group Adventure Plans"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;
