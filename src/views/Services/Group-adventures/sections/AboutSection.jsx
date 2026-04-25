import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Group Adventures — shared journeys and new connections"
    description={[
      "Group Adventures offer enriching, guided outings where companions explore the outdoors alongside a small, well-matched group — including mine. Each journey is designed to be calm, safe, and socially rewarding, with plenty of space for sniffing trails, gentle play, and relaxed discovery.",
      "I lead and supervise every outing, ensuring each companion feels supported and included at their own pace. After the adventure, you’ll receive thoughtful updates and photos — a glimpse into the moments of curiosity, confidence, and connection that unfold along the way.",
    ]}
    highlights={[
      {
        title: "Social & secure",
        description:
          "Your companion joins a small, carefully chosen group — always supervised, never overwhelming — so connections form naturally and comfortably.",
      },
      {
        title: "Enriching outdoor journeys",
        description:
          "Gentle exploration, new environments, and shared movement — ideal for nurturing confidence, easing anxiety, and offering meaningful enrichment.",
      },
    ]}
  />
);

export default AboutSection;
