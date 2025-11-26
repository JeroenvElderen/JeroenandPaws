import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "home-check-in-30",
    title: "Essential Home Visit",
    label: "30-Min Visit",
    price: "€15/visit",
    description:
      "A focused visit to maintain your companion’s routine — fresh water, feeding if required, an outdoor break, and calm interaction, followed by a brief update for reassurance.",
    duration: "30-Min Visit",
    durationMinutes: 30,
    ctaText: "Book check-in",
  },
  {
    id: "home-check-in-60",
    title: "Extended Home Visit",
    label: "60-Min Visit",
    price: "€25/visit",
    description:
      "A longer, unhurried visit offering additional time for movement, engagement, or quiet companionship — ideal for companions who need extra support or settle best with a steady presence.",
    duration: "60-Min Visit",
    durationMinutes: 60,
    ctaText: "Book extended visit",
  },
  {
    id: "home-check-in-custom",
    title: "Tailored Home Support",
    label: "Flexible Timing",
    price: "Tailored",
    description:
      "For companions with routines or requirements that don’t fit a standard visit — whether that means multiple check-ins, medication, or specific timings — we create a plan shaped around what they need most.",
    duration: "Custom Plan",
    durationMinutes: null,
    ctaText: "Plan a custom check-in",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=home-check-in-custom",
      heading: "How would you like to plan your custom check-in?",
      description:
        "Share the details that matter — timings, visit frequency, or any special instructions — then choose whether to discuss them in a chat or outline them in the request form.",
    },
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Home Check-Ins — Flexible Care at Home"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;
