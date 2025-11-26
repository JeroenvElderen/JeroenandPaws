import React from "react";
import DynamicPricingSection from "../../../../components/Pricing/DynamicPricingSection";
import { getPreferredChatUrl } from "../../../../utils/chatLinks";

const services = [
  {
    id: "daytime-care-half-day",
    title: "Half-day stay",
    label: "Up to 4 Hours",
    price: "€20/day",
    description:
      "A relaxed daytime stay — ideal for companions who need a few hours of gentle activity, rest, and attention before heading home.",
    duration: "4 Hour Stay",
    durationMinutes: 240,
    ctaText: "Book half-day stay",
  },
  {
    id: "daytime-care-full-day",
    title: "Full-day care",
    label: "Up to 8 Hours",
    price: "€30/day",
    description:
      "A complete day of calm supervision, enrichment, and rest — perfect when you’re at work or occupied and want your companion genuinely supported throughout the day.",
    duration: "8 Hour Stay",
    durationMinutes: 480,
    ctaText: "Book full-day care",
  },
  {
    id: "daytime-care-custom",
    title: "Tailored daytime care",
    label: "Flexible Options",
    price: "Tailored",
    description:
      "Unique timing? Late pickup? Extra enrichment? Let's create a daytime schedule perfectly matched to your companion's routine and needs",
    duration: "Custom Schedule",
    durationMinutes: null,
    ctaText: "Plan tailored care",
    ctaOptions: {
      chatUrl: getPreferredChatUrl(),
      formUrl: "/contact?service=daytime-care-custom",
      heading: "How would you like to plan tailored daytime care?",
      description:
        "Share your companion’s routine through WhatsApp or the request form, and we’ll adjust pickup, drop-off, and activities to suit them.",
    },
  },
];

const PricingSection = () => (
  <DynamicPricingSection
    title="Daytime care plans for every companion"
    services={services}
    gridClassName="grid_3-col"
    defaultCta="Check availability"
  />
);

export default PricingSection;