import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About daytime care"
    title="Daytime care that feels like home for your companion"
    description={[
      "While you’re away, your companion enjoys a safe, nurturing, and engaging environment. With playtime, gentle social moments, regular breaks, and calm spaces to rest, they stay content, enriched, and relaxed throughout the day.",
      "You’ll receive thoughtful updates — including photos and small highlights — so you can follow their day and feel reassured that they’re being cared for with genuine attention.",
    ]}
    highlights={[
      {
        title: "A comforting daily rhythm",
        description:
          "For a full day or just a few hours, I ensure your companion remains engaged, well-rested, and gently guided by a routine that reflects their natural rhythm.",
      },
      {
        title: "A safe and caring environment",
        description:
          "From supervised interactions to clean spaces and fresh water always available, your companion enjoys an environment designed to feel secure, calm, and comfortably familiar.",
      },
    ]}
  />
);

export default AboutSection;
