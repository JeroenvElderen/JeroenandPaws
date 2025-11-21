import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "daily-stroll-30",
    title: "Standard Check-In",
    label: "30-Min Visit",
    price: "€15/visit",
    description:
      "Fresh water, feeding, potty break, playtime — everything your dog needs while you’re away.",
    duration: "30-Min Visit",
    durationMinutes: 30,
    ctaText: "Book Check-In",
  },
  {
    id: "daily-stroll-60",
    title: "Extended Check-In",
    label: "60-Min Visit",
    price: "€25/visit",
    description:
      "Extra time for play, longer potty breaks, or more companionship — perfect for pups who need more love.",
    duration: "60-Min Visit",
    durationMinutes: 60,
    ctaText: "Book Extended Visit",
  },
  {
    id: "daily-stroll-custom",
    title: "Custom Care",
    label: "Flexible Visit",
    price: "Tailored",
    description:
      "Need special timing or extra help? Let’s create the perfect plan for your dog’s day.",
    duration: "Custom Plan",
    durationMinutes: null,
    ctaText: "Build a custom visit",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=daily-stroll-custom",
      heading: "How would you like to plan your custom check-in?",
      description:
        "Tell us what you need — we can coordinate on WhatsApp or you can share details in a quick form.",
    },
  },
];

const DailystrollsPricingSection = () => (
  <DynamicPricingSection
    title="Home Check-In Options"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default DailystrollsPricingSection;