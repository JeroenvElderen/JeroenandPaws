import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Daily dog walks designed for your pup’s happiness"
    description={[
      "Every walk is tailored to your dog’s pace, personality, and needs. Whether they’re a high-energy explorer or a relaxed stroller, I make sure each outing is safe, comfortable, and enriching.",
      "You’ll receive quick post-walk updates with photos, highlights from the route, and notes on water breaks or anything else worth sharing — so you’re always connected, even while away.",
    ]}
    highlights={[
      {
        title: "Reliable routine",
        description:
          "Choose the schedule that works best for you — daily, weekly, or just a few times — and I’ll help keep your dog happy, healthy, and on track.",
      },
      {
        title: "Safety & comfort first",
        description:
          "I check harnesses and leashes, adjust for weather, and ensure a positive experience every time we step outside.",
      },
    ]}
  />
);

export default AboutSection;
