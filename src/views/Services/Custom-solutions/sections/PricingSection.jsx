import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "custom-care-plan",
    title: "Bespoke Care Plan",
    label: "Tailored Care",
    price: "Custom Quote",
    description:
      "A personalised plan created around your dog’s lifestyle, temperament, and daily needs.",
    duration: "Flexible",
    durationMinutes: null,
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=custom-care-plan",
      heading: "How should we design your dog’s care plan?",
      description:
        "Chat via WhatsApp to discuss needs quickly, or send a detailed request through the form.",
    },
  },
  {
    id: "behaviour-consultation",
    title: "Behaviour Consultation",
    label: "Behaviour Support",
    price: "ustom Quote",
    description:
      "Guidance for anxiety, reactivity, manners, and home behaviour — with clear steps you can use right away.",
    duration: "Flexible",
    durationMinutes: null,
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=behaviour-consultation",
      heading: "What behaviour should we focus on?",
      description:
        "Send details through the form, or start a WhatsApp chat for quick questions before booking.",
    },
  },
  {
    id: "custom-training",
    title: "Custom Training Programme",
    label: "Training Programme",
    price: "Custom Quote",
    description:
      "A structured training path tailored to your dog’s personality, pace, and long-term goals.",
    duration: "Multi-Session",
    durationMinutes: null,
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=custom-training-programme",
      heading: "What goals would you like your dog to achieve?",
      description:
        "Tell me your training challenges, and I’ll design a programme that fits your dog and your schedule.",
    },
  },
  {
    id: "specialist-support",
    title: "Specialist Support",
    label: "Special Care",
    price: "Custom Quote",
    description:
      "Ideal for dogs with medical needs, behaviour complexities, or unique routines that require dedicated attention.",
    duration: "As Needed",
    durationMinutes: null,
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=specialist-support",
      heading: "Tell me what your dog needs help with",
      description:
        "Start a quick chat for guidance or submit a detailed overview if your dog has specific care requirements.",
    },
  },
];


const PricingSection = () => (
  <DynamicPricingSection
    title="Tailored solutions for every dog"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;
