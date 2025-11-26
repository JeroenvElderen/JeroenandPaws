import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Overnight Stays — A Calm, Familiar Home to Settle In"
    description={[
      "When you are away, your companion stays in a calm and welcoming home environment. With gentle company and steady routines, they can settle in, feel included, and enjoy familiar, household comfort.",
      "Daily walks, rest, affection, and predictable rhythms help your companion adjust with ease. By keeping routines familiar, they can relax, feel secure, and rest without disruption.",
      "You will receive thoughtful updates and photographs during their stay, offering clarity and reassurance so you can travel with confidence.",
    ]}
    highlights={[
      {
        title: "Familiar routines and calm structure",
        description:
          "Meals, walks, and quiet time follow what your companion already knows, helping them feel settled and supported from the start.",
      },
      {
        title: "Gentle companionship",
        description:
          "Calm companionship and steady social presence for companions who enjoy sharing space with others in a low-pressure way.",
      },
      {
        title: "Safe, reassuring home environment",
        description:
          "Clean, cosy spaces and attentive supervision provide a home environment where your companion lives as part of the household — never in kennels or crowded settings.",
      },
      {
        title: "Personal attention and clear communication",
        description:
          "By welcoming only a small number of companions, I provide individual attention and gentle interaction, along with regular updates so you remain informed throughout their stay.",
      },
    ]}
  />
);

export default AboutSection;
