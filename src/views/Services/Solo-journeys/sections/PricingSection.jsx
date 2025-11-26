import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "solo-journey-180",
    title: "Half-Day Solo Journey",
    label: "3-Hour Journey",
    price: "€60/journey",
    description:
      "A half-day, one-to-one outing with steady exploration, time to pause, and space for curiosity — shaped entirely around your companion’s pace and interests.",
    duration: "3-Hour Journey",
    durationMinutes: 180,
    ctaText: "Book half-day journey",
  },
  {
    id: "solo-journey-360",
    title: "Full-Day Solo Journey",
    label: "6-Hour Journey",
    price: "€110/journey",
    description:
      "A full day spent exploring together — unhurried movement, rest breaks as needed, and dedicated attention throughout, creating a relaxed and engaging day for your companion.",
    duration: "6-Hour Journey",
    durationMinutes: 360,
    ctaText: "Book full-day journey",
  },
  {
    id: "solo-journey-custom",
    title: "Tailored Solo Journey",
    label: "Flexible Hours",
    price: "Tailored",
    description:
      "For companions with unique needs or routines — choose the timing, route, and pace, and we will create a journey shaped entirely around them.",
    duration: "Custom Journey",
    durationMinutes: null,
    ctaText: "Plan a solo journey",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=solo-journey-custom",
      heading: "How should we plan your custom stay?",
      description:
        "Choose a quick WhatsApp chat to discuss dates and details, or outline your full request through the form.",
    },
  },
];

const SoloJourneyPricingSection = () => (
  <DynamicPricingSection
    title="Solo Journey Plans"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default SoloJourneyPricingSection;
