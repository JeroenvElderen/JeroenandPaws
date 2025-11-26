import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "daytime-care-half-day",
    title: "Half-day stay",
    label: "Up to 4 Hours",
    price: "€20/day",
    description:
      "Perfect for pups who just need a short stay — playtime, potty breaks, and some snuggles before heading home.",
    duration: "4 Hour Stay",
    durationMinutes: 240,
    ctaText: "Book Half-Day",
  },
  {
    id: "daytime-care-full-day",
    title: "Full-Day of Fun",
    label: "Up to 8 Hours",
    price: "€30/day",
    description:
      "A whole day of play, rest, and love — ideal for keeping your dog happy and cared for while you’re at work or busy.",
    duration: "8 Hour Stay",
    durationMinutes: 480,
    ctaText: "Book Full-Day",
  },
  {
    id: "daytime-care-custom",
    title: "Custom Care",
    label: "Flexible Options",
    price: "Tailored",
    description:
      "Need special timing, a late pickup, or extra activities? Let’s design a schedule that works best for your pup.",
    duration: "Custom Schedule",
    durationMinutes: null,
    ctaText: "Plan a custom schedule",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=daytime-care-custom",
      heading: "How do you want to plan daytime care?",
      description:
        "Share your dog’s needs over WhatsApp or use the request form so we can tailor pick-up, drop-off, and activities.",
    },
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Daytime care plans for every companion"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;