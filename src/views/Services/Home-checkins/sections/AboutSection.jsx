import React from "react";
import ServiceAboutSection from "../../../../components/ServiceAboutSection";

const AboutSection = () => (
  <ServiceAboutSection
    eyebrow="About this service"
    title="Thoughtful Home Check-Ins for Peace of Mind"
    description={[
      "When you can’t be home, I’ll stop by to make sure your dog is safe, comfortable, and cared for. Each visit can include feeding, fresh water, potty breaks, playtime, and a little love and companionship.",
      "You’ll receive quick updates and photos so you know everything’s okay and can relax while you’re away.",
    ]}
    highlights={[
      {
        title: "Personal, one-on-one care",
        description:
          "It’s just me — no rushed visits or distractions. Your dog gets my full attention and gentle care during every check-in.",
      },
      {
        title: "Reliable & flexible",
        description:
          "Whether it’s a midday break, an evening visit, or a quick drop-in, I’ll follow your routine and keep your pup happy and comfortable.",
      },
    ]}
  />
);

export default AboutSection;
