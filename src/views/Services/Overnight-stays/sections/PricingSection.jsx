import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "overnight-stay-standard",
    title: "Standard Overnight Stay",
    label: "Boarding — 24 hrs",
    price: "€45/night",
    description:
      "Overnight care in a calm, home setting — with relaxed routines, outdoor time, and comfortable rest in a lived-in environment.",
    duration: "Overnight Stay",
    durationMinutes: 24 * 60,
    ctaText: "Book overnight stay",
    allowRecurring: false,
    allowMultiDay: false,
  },
  {
    id: "overnight-stay-custom",
    title: "Tailored Overnight Support",
    label: "Custom duration",
    price: "Tailored",
    description:
      "For companions who require extra nights, special routines, or unique timings — we create a stay shaped around their needs and your schedule.",
    duration: "Custom Duration",
    durationMinutes: null,
    ctaText: "Plan a tailored stay",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=overnight-stay-custom",
      heading: "How should we plan your custom stay?",
      description:
        "Choose a quick WhatsApp chat to discuss dates and care details, or share your full request through the form.",
    },
    allowRecurring: false,
    allowMultiDay: false,
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Overnight Stay Options"
    services={services}
    gridClassName="grid_4-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;
