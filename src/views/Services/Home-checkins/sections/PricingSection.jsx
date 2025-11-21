import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "home-check-in-30",
    title: "Standard Check-In",
    label: "30-Min Visit",
    price: "€15/visit",
    description:
      "A quick but caring visit — fresh water, feeding if needed, potty break, playtime, and a photo update for peace of mind.",
    duration: "30-Min Visit",
    durationMinutes: 30,
    ctaText: "Book Check-In",
  },
  {
    id: "home-check-in-60",
    title: "Extended Check-In",
    label: "60-Min Visit",
    price: "€25/visit",
    description:
      "More time for attention and play — ideal if your dog needs extra exercise, a longer walk, or a bit more companionship while you’re away.",
    duration: "60-Min Visit",
    durationMinutes: 60,
    ctaText: "Book Extended Visit",
  },
  {
    id: "home-check-in-custom",
    title: "Custom Care",
    label: "Flexible Timing",
    price: "Tailored",
    description:
      "Need something special — multiple visits, medication, or unique timing? We can create the perfect plan for your dog and your schedule.",
    duration: "Custom Plan",
    durationMinutes: null,
    ctaText: "Plan a custom check-in",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=home-check-in-custom",
      heading: "How would you like to plan your custom check-in?",
      description:
        "Tell us the timing, visit frequency, or medications — chat on WhatsApp or outline everything in the request form.",
    },
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Home Check-In Options"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;