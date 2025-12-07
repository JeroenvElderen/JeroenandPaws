import React from "react";
import FaqAccordion from "../../../../components/faq/FaqAccordion";

const FaqSection = () => {

  const faqs = [
    {
      question: "Where will my dog stay?",
      answer:
        "Your dog stays inside my home, not in a kennel or separate facility. They have access to comfortable resting areas, safe indoor spaces, and a calm household environment designed to feel familiar and reassuring.",
    },
    {
      question: "How do you help dogs feel comfortable?",
      answer:
        "I follow your dog’s usual routines — from mealtimes to rest spots — and give them calm attention, outdoor breaks, and gentle interaction. Familiar structure helps them relax and settle at their own pace.",
    },
    {
      question: "Can you board dogs with special needs or seniors?",
      answer:
        "Yes. I can support senior dogs and those with specific routines, medication requirements, or reduced mobility. Simply share what they need, and I will ensure their stay remains comfortable and predictable.",
    },
    {
      question: "Will my dog get along with your dogs?",
      answer:
        "Before the stay, I introduce dogs gradually to ensure everyone feels safe. If a dog prefers more space or quiet time, I can separate rest areas and manage interactions thoughtfully.",
    },
    {
      question: "Will I get updates while I’m away?",
      answer:
        "Yes. I send updates and photographs each day so you always know how your dog is resting, eating, and settling into the routine.",
    },
    {
      question: "Do you have space for more than one dog from the same household?",
      answer:
        "Yes. If your dogs are used to living together, they can stay as a pair. Just let me know in advance so I can prepare their sleeping and rest areas accordingly.",
    },
    {
      question: "What should my dog bring for their stay?",
      answer:
        "Please send their regular food, any medication, and a familiar item such as a blanket or toy. Familiar scents help dogs settle quickly in a new space.",
    },
    {
      question: "Can I visit your home before booking?",
      answer:
        "Of course. A brief meet-and-greet helps your dog become familiar with the space and allows us to discuss routines, expectations, and any questions you may have.",
    },
    {
      question: "How do you handle overnight supervision?",
      answer:
        "I remain on-site throughout the night, so your dog is never left alone. Their comfort and safety are monitored just as they would be in a home of their own.",
    },
    {
      question: "What if my travel plans change?",
      answer:
        "I understand that plans sometimes shift. Please get in touch as soon as possible, and I’ll do my best to accommodate adjustments where availability allows.",
    },
  ];

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Overnight Stays — Frequently Asked Questions</h2>
          <p className="subheading">
            Clear answers to the most common questions about overnight care —
            helping you feel confident that your dog is safe, supervised, and
            supported throughout their stay.
          </p>
        </div>

        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
};

export default FaqSection;
