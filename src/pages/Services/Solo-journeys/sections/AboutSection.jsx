import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Solo Journeys — One-on-One Adventures for Your Dog"
    description={[
      "Solo Journeys are perfect for dogs who thrive with individual attention and a calm, focused experience. Just me and your pup exploring at their own pace — whether that’s an adventurous hike, a peaceful park stroll, or plenty of sniffing and discovery.",
      "We’ll go beyond the usual routine: drive out to explore new places, discover quiet forest trails, hike in the mountains, wander charming towns, or even enjoy a breezy day by the beach. Each outing is carefully chosen to be safe, fun, and enriching for your dog.",
      "These journeys are completely tailored to your dog’s needs, personality, and energy level. You’ll receive updates and photos along the way, so you know your best friend is safe, happy, and having a great time.",
    ]}
    highlights={[
      {
        title: "Fully personalized",
        description:
          "Every journey is built around your dog — their favorite pace, routes, and comfort level. Great for shy pups, solo explorers, or those needing special care.",
      },
      {
        title: "Calm & focused care",
        description:
          "No distractions, no crowds — just me and your dog enjoying time outdoors together, discovering new places safely and happily.",
      },
      {
        title: "Big adventures made easy",
        description:
          "From forest trails to mountain hikes or a relaxed beach day, I handle the planning and driving so your pup can simply enjoy the journey.",
      },
      {
        title: "Regular updates for peace of mind",
        description:
          "You’ll get photos, notes, and updates throughout the day so you know your dog is safe, happy, and having the time of their life.",
      },
    ]}
  />
);

export default AboutSection;
