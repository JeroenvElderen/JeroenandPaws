import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Solo Journeys — Individual Outings Shaped Around Your Companion"
    description={[
      "Solo Journeys are designed for companions who benefit from individual attention and a calm, focused experience. It is simply the two of us exploring at their pace — whether that means a steady walk, peaceful time outdoors, or space to pause and take things in.",
      "These outings go beyond everyday walks. We may explore quiet forest paths, visit new areas, enjoy open beaches, or wander through nearby towns. Each location is chosen with care to ensure a safe, enriching, and engaging experience.",
      "Every journey is shaped around your companion’s needs, confidence, and energy level. You will receive thoughtful updates and photographs along the way, offering reassurance and a clear sense of how they are getting on.",
    ]}
    highlights={[
      {
        title: "Tailored for your companion",
        description:
          "Each outing is planned around your companion’s preferred pace, familiarity, and comfort level. Ideal for independent explorers or those who benefit from gentle, individual attention.",
      },
      {
        title: "Calm, focused time outdoors",
        description:
          "No distractions or competing demands — simply dedicated time outdoors, discovering new places in a measured, reassuring way.",
      },
      {
        title: "Exploration without the effort",
        description:
          "Whether it’s a walk through quiet woods, a gentle hike, or time near the coast, I handle the planning and travel so your companion can simply enjoy the experience.",
      },
      {
        title: "Clear communication throughout",
        description:
          "Photographs and notes throughout the outing keep you informed and reassured, offering a clear picture of how your companion is spending their time.",
      },
    ]}
  />
);

export default AboutSection;
