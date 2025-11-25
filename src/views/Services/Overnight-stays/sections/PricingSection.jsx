import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "overnight-stay-standard",
    title: "Cozy Overnight Stay",
    label: "Boarding — 24 hrs",
    price: "€45/night",
    description:
      "Safe and loving overnight care in my home — daily walks, playtime, and cozy rest alongside my two friendly pups.",
    duration: "Overnight Stay",
    durationMinutes: 24 * 60,
    ctaText: "Book Boarding",
    allowRecurring: false,
    allowMultiDay: false,
  },
  {
    id: "overnight-stay-custom",
    title: "Your Dog’s Perfect Stay",
    label: "Custom duration",
    price: "Tailored",
    description:
      "Need extra nights or special care? We’ll create a plan that fits your schedule and your dog’s needs.",
    duration: "Custom Duration",
    durationMinutes: null,
    ctaText: "Plan a custom stay",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=overnight-stay-custom",
      heading: "How should we plan your custom stay?",
      description:
        "Choose WhatsApp for a quick chat about dates and care notes, or send your full request through the form.",
    },
    allowRecurring: false,
    allowMultiDay: false,
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Boarding Rates"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;