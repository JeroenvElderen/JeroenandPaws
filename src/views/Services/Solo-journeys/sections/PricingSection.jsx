import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "solo-journey-180",
    title: "Half-Day Explorer",
    label: "3-Hour Journey",
    price: "€60/journey",
    description:
      "A private half-day adventure — long walks, sniffing trails, playtime, and plenty of breaks just for your pup.",
    duration: "3-Hour Journey",
    durationMinutes: 180,
    ctaText: "Book Half-Day",
  },
  {
    id: "solo-journey-360",
    title: "Full-Day Adventure",
    label: "6-Hour Journey",
    price: "€110/journey",
    description:
      "A full day of exploring together — long walks, rest stops, and plenty of one-on-one attention for your dog’s perfect day out.",
    duration: "6-Hour Journey",
    durationMinutes: 360,
    ctaText: "Book Full-Day",
  },
  {
    id: "solo-journey-custom",
    title: "Custom Journey",
    label: "Flexible Hours",
    price: "Tailored",
    description:
      "Have something special in mind? Let’s design the perfect solo day — custom timing, routes, and pace for your pup.",
    duration: "Custom Journey",
    durationMinutes: null,
    ctaText: "Plan a solo journey",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=solo-journey-custom",
      heading: "How should we plan your custom stay?",
      description:
        "Choose WhatsApp for a quick chat about dates and care notes, or send your full request through the form.",
    },
  },
];

const SoloJourneyPricingSection = () => (
  <DynamicPricingSection
    title="Solo Journey Options"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default SoloJourneyPricingSection;
