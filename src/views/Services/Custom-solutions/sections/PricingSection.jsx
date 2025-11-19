import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";

const services = [
  {
    id: "daily-stroll-30",
    title: "30-Min Walks",
    label: "30-Min Walks",
    price: "€10/mo",
    description: "Perfect for quick strolls",
    duration: "30 Minutes",
    durationMinutes: 30,
    ctaText: "Book a Walk",
  },
  {
    id: "daily-stroll-60",
    title: "60-Min Walks",
    label: "60-Min Walks",
    price: "€20/mo",
    description: "Great for active dogs",
    duration: "60 Minutes",
    durationMinutes: 60,
    ctaText: "Reserve Now",
  },
  {
    id: "daytime-care-8h",
    title: "120-min walks",
    label: "120-min walks",
    price: "€30/mo",
    description: "Half or full day options",
    duration: "2 Hours",
    durationMinutes: 120,
    ctaText: "Join Day Care",
  },
  {
    id: "custom-meet-greet",
    title: "Custom walk",
    label: "Custom walk",
    price: "Tailored",
    description: "Training, boarding & more",
    duration: "Custom Plan",
    durationMinutes: null,
    ctaText: "Let’s Chat",
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Care Plans for Every Pup"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;
