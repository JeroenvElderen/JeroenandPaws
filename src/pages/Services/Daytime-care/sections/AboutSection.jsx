import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Daytime dog care that feels like home"
    description={[
      "While you’re busy, your dog will spend the day in a safe, loving, and fun environment. I provide playtime, socialization, potty breaks, and cozy rest so your pup stays happy and relaxed until you’re back.",
      "You’ll get simple updates and sweet photos, so you can see how their day is going and feel confident they’re cared for like family.",
    ]}
    highlights={[
      {
        title: "Comfortable daily routine",
        description:
          "Whether it’s a full day or just a few hours, I’ll keep your dog engaged, well-rested, and on a schedule that suits their needs.",
      },
      {
        title: "Safe & caring environment",
        description:
          "From supervised play to clean spaces and plenty of fresh water, I make sure your pup feels secure and content all day long.",
      },
    ]}
  />
);

export default AboutSection;
