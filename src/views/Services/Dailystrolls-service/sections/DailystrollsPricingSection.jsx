import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "daily-stroll-30",
    title: "Standard stroll",
    label: "30-Min Visit",
    price: "€15/visit",
    description:
      "A refreshing 30-minute stroll — ideal for movement, fresh air, and a little enrichment during the day.",
    duration: "30-Min Visit",
    durationMinutes: 30,
    ctaText: "Book Check-In",
  },
  {
    id: "daily-stroll-60",
    title: "Extended stroll",
    label: "60-Min Visit",
    price: "€25/visit",
    description:
      "A longer outing with extra time for sniffing, exploring, and enjoying the neighbourhood — perfect for companions who love a fuller adventure.",
    duration: "60-Min Visit",
    durationMinutes: 60,
    ctaText: "Book Extended Visit",
  },
  {
    id: "daily-stroll-custom",
    title: "Custom Care",
    label: "Tailored stroll",
    price: "Tailored",
    description:
      "Unique schedule? Preferred routes? Special requests? Let’s design a personalised walking plan that fits your companion’s needs.",
    duration: "Custom Plan",
    durationMinutes: null,
    ctaText: "Build a custom visit",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=daily-stroll-custom",
      heading: "How would you like to plan your tailored stroll?",
      description:
        "Tell us what you have in mind — start a quick WhatsApp chat or share your details through the form.",
    },
  },
];

const DailystrollsPricingSection = () => (
  <DynamicPricingSection
    title="Daily stroll options for every companion"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default DailystrollsPricingSection;