import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    title="Daily walks designed to enrich your companion’s day"
    description={[
      "Every walk is shaped around your companion’s pace, personality, and preferences. Whether they love exploring new scents or enjoy a calm neighbourhood stroll, each outing is designed to feel safe, comforting, and mentally enriching.",
      "After each walk, you’ll receive a brief update — photos, route highlights, and any helpful notes — so you always feel connected to your companion’s day, even when you’re not there.",
    ]}
    highlights={[
      {
        title: "A routine you can rely on",
        description:
          "Choose a schedule that suits your life — daily, weekly, or as needed — and I’ll keep your companion engaged, active, and joyfully on track.",
      },
      {
        title: "Safety and comfort, every step of the way",
        description:
          "From secure harness checks to weather-ready adjustments, every walk is thoughtfully prepared to ensure a positive, comfortable experience — wherever your companion’s paws take us.",
      },
    ]}
  />
);

export default AboutSection;
