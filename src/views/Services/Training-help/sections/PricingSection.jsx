import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "training-intro",
    title: "Introductory Training Session",
    label: "30-Min Session",
    price: "€7/session",
    description:
      "A short, focused session ideal for introducing new skills, addressing simple behaviours, or supporting young companions with early foundations.",
    duration: "30-Min Session",
    durationMinutes: 30,
  },
  {
    id: "training-standard",
    title: "Standard Training Session",
    label: "60-Min Session",
    price: "€12/session",
    description:
      "A structured session with time to learn, practise, and reinforce behaviours in a calm, supportive way.",
    duration: "60-Min Session",
    durationMinutes: 60,
  },
  {
    id: "training-extended",
    title: "Extended Training Session",
    label: "120-Min Session",
    price: "€22/session",
    description:
      "An extended session designed for companions who benefit from slower pacing, more repetition, or additional guidance.",
    duration: "2-Hour Session",
    durationMinutes: 120,
  },
  {
    id: "training-custom",
    title: "Tailored Training Plan",
    label: "Flexible Duration",
    price: "Tailored",
    description:
      "For companions who require something more specific — unique routines, behavioural goals, or varied environments — we will create a plan shaped around their needs.",
    duration: "Custom Plan",
    durationMinutes: null,
    ctaText: "Plan a tailored session",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=training-help-custom",
      heading: "How should we plan your tailored session?",
      description:
        "Choose a WhatsApp chat to discuss aims and timings, or outline everything in the form.",
    },
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Training Help — Session Options"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;
