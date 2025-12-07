import React from "react";
import FaqAccordion from "../../../../components/faq/FaqAccordion";

const FaqSection = () => {

  const faqs = [
    {
      question: "What are Group Adventures?",
      answer:
        "Group Adventures are guided outdoor experiences where a small number of well-matched dogs spend time exploring, socialising, and enjoying nature together. Each group is selected with care so every dog feels relaxed, supported, and part of the moment.",
    },
    {
      question: "How many dogs take part in each adventure?",
      answer:
        "Each adventure includes only a small number of dogs. This calm group size ensures individual attention, steady supervision, and a comfortable experience for every dog.",
    },
    {
      question: "Can shy or energetic dogs join?",
      answer:
        "Absolutely. I take time to understand each dog’s behaviour and comfort level before placing them in a group. More reserved dogs are supported gently, while energetic dogs are given safe, structured outlets for play.",
    },
    {
      question: "Where do the adventures happen?",
      answer:
        "Adventures take place in carefully chosen outdoor locations — peaceful trails, secure open spaces, and natural environments where dogs can move, explore, and enjoy their surroundings.",
    },
    {
      question: "Will I receive updates after the adventure?",
      answer:
        "Yes. After each outing, you will receive a short update with photographs and a brief reflection on your dog’s experience — who they spent time with, what they enjoyed, and how they settled into the day.",
    },
    {
      question: "How do you prepare dogs for their first adventure?",
      answer:
        "Before joining a group, each dog is introduced gradually. I take time to understand their behaviour, confidence, and comfort levels so the first outing feels calm, familiar, and positive.",
    },
    {
      question: "What should my dog bring to an adventure?",
      answer:
        "Your dog only needs a well-fitted harness and any essentials you’d like me to carry, such as treats or medication. I provide fresh water and everything else required for a safe outing.",
    },
    {
      question: "Do adventures go ahead in all weather?",
      answer:
        "Most adventures continue in everyday weather conditions, as long as they remain safe. If conditions become extreme, I will adjust plans, shorten the outing, or reschedule with clear communication.",
    },
    {
      question: "How long does each adventure last?",
      answer:
        "Adventures typically last around an hour, not including travel time. This allows dogs to settle, explore, and enjoy meaningful interaction without becoming overtired.",
    },
    {
      question: "What happens if my dog doesn’t get along with others?",
      answer:
        "I pay close attention to group dynamics. If a dog seems uncomfortable or mismatched, I adjust the group or create a more suitable setting so they remain safe and at ease.",
    },
    {
      question: "Are adventures suitable for young or senior dogs?",
      answer:
        "Yes, provided the outing matches their physical ability and confidence. I take age, stamina, and any health considerations into account before confirming a space.",
    },
    {
      question: "Do you offer transport for the adventures?",
      answer:
        "Yes. I collect and return dogs safely, using secure travel equipment and calm handling so the journey feels as comfortable as the outing itself.",
    },
    {
      question: "How do you handle emergencies or unexpected situations?",
      answer:
        "I carry essential safety equipment, maintain pet first-aid knowledge, and have clear procedures in place. If anything unexpected occurs, I respond calmly and contact you promptly.",
    },
  ];

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Group Adventures — Frequently Asked Questions</h2>
          <p className="subheading">
            A clear guide to how these calm, well-structured outings work — thoughtful adventures where dogs can explore, learn, and enjoy gentle social time.
          </p>
        </div>

        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
};

export default FaqSection;
