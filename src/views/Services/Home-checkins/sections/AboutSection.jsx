import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Home Check-Ins — Calm, Consistent Care at Home"
    description={[
      "When you are away, I’ll visit your companion at home to ensure they remain safe, settled, and well cared for. Each check-in can include feeding, fresh water, outdoor breaks, calm interaction, and reassuring company tailored to their routine.",
      "You will receive brief updates and photographs after each visit, offering clarity and reassurance so you can feel at ease while away.",
    ]}
    highlights={[
      {
        title: "Personal, attentive care",
        description:
          "Each visit is unhurried and focused. Your companion receives my full attention, gentle handling, and calm presence throughout the check-in.",
      },
      {
        title: "Reliable and adaptable support",
        description:
          "Whether it’s a midday break, evening visit, or brief drop-in, I follow your routine with care so your companion remains comfortable, settled, and supported.",
      },
    ]}
  />
);

export default AboutSection;
