import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Boarding — A Cozy Home With Friendly Company"
    description={[
      "When you’re away, your dog can stay somewhere safe, loving, and relaxed — my home. Alongside my two friendly dogs, your pup will have gentle companionship and a calm, welcoming pack to feel part of.",
      "I keep routines familiar with daily walks, playtime, rest, and plenty of affection, so your dog can settle in and feel comfortable while you’re gone.",
      "You’ll get updates and photos throughout their stay, so you can travel with peace of mind, knowing your best friend is happy and well cared for.",
    ]}
    highlights={[
      {
        title: "Familiar, loving routine",
        description:
          "Meals, walks, and nap times kept close to what your dog knows, helping them relax and feel safe from day one.",
      },
      {
        title: "Company of gentle dogs",
        description:
          "My two well-socialized pups offer friendly companionship — perfect for dogs who enjoy having easy-going friends around.",
      },
      {
        title: "Safe & home-like environment",
        description:
          "Clean, cozy spaces and constant supervision. Your dog lives like family — not in a kennel or crowded space.",
      },
      {
        title: "Personal attention & updates",
        description:
          "Because I board only a few dogs at once, yours gets plenty of love, play, and one-on-one time. Plus, regular photo and message updates for your peace of mind.",
      },
    ]}
  />
);

export default AboutSection;
