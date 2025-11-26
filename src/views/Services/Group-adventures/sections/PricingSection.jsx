import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "group-adventure-120",
    title: "2-Hour Adventure",
    label: "Group Walk",
    price: "€22",
    description:
      "An extended group outing with time for movement, exploration, and calm social engagement — ideal for active companions.",
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
      "Additional time outdoors for steady interaction, relaxed walks, and restful pauses amongst familiar companions.",
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
      "A full day of guided activity — varied walks, purposeful play, and restorative downtime, all supported with attentive supervision.",
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
      "Looking for something more tailored? We can shape a group adventure around your companion’s routine, comfort, and specific requirements.",
    duration: "Custom Adventure",
    durationMinutes: null,
    ctaText: "Plan Custom Adventure",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=group-adventures-custom",
      heading: "How would you like to plan your custom check-in?",
      description:
        "Share the details that matter — timing, visit frequency, and any special instructions — then choose whether to discuss them in a chat or outline them in the request form.",
    },
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
