import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Group Adventures — Exploring Together With New Friends"
    description={[
      "Group Adventures are all about safe social fun. I bring a small group of friendly, well-matched dogs — including mine — so everyone has a buddy to sniff, run, and wander with. We head to safe spots where dogs can explore, play, and enjoy the outdoors together.",
      "I personally guide and supervise the whole adventure, making sure every dog feels comfortable and included. Afterward, you’ll get photos and updates so you can see the tail wags and new friendships forming.",
    ]}
    highlights={[
      {
        title: "Social & safe",
        description:
          "Your dog meets other friendly pups (including mine) in a calm, controlled group — never too big, always supervised.",
      },
      {
        title: "Fun outdoor adventures",
        description:
          "Walks, play, sniffing trails, and exploring new places together — perfect for building confidence and burning off energy.",
      },
    ]}
  />
);

export default AboutSection;
