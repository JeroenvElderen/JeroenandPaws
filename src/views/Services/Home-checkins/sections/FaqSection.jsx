import React from "react";
import FaqAccordion from "../../../../components/faq/FaqAccordion";

const FaqSection = () => {

  const faqs = [
    {
      question: "What’s included in a home check-in?",
      answer:
        "Each visit is tailored to your dog’s needs — fresh water, feeding if required, outdoor breaks, calm interaction, and reassurance. You will also receive a brief update and photograph so you always know how they are doing.",
    },
    {
      question: "Are check-ins one-on-one?",
      answer:
        "Yes. I work independently, which means your dog receives my full attention during every visit — no distractions, no overlapping appointments, and no rushed care.",
    },
    {
      question: "Can you handle special routines or medication?",
      answer:
        "Yes. I can follow your dog’s established routine, administer medication if required, and maintain familiar patterns to help reduce stress and keep things predictable while you are away.",
    },
    {
      question: "How long is each visit?",
      answer:
        "A standard visit is around 30 minutes, while extended visits last approximately an hour. Both include time for care, attention, and a calm check of your dog’s wellbeing.",
    },
    {
      question: "Do you offer updates after every visit?",
      answer:
        "Yes. After each check-in, you will receive a short message and a photograph so you know how your dog is, what they enjoyed, and how they settled.",
    },
    {
      question: "What if my dog is nervous or shy?",
      answer:
        "That’s perfectly fine. I take a calm and gradual approach, allowing shy or sensitive dogs to feel comfortable at their own pace.",
    },
    {
      question: "Can you help if my dog needs more than one visit per day?",
      answer:
        "Yes. We can arrange multiple check-ins to match your dog’s routine, whether that includes feeding, medication, or reassurance at different times of the day.",
    },
    {
      question: "Do you enter the home if no one is there?",
      answer:
        "Yes, with your permission. Many clients provide a key or access code. I handle entry securely and follow your instructions to ensure everything remains safe and respected.",
    },
  ];

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Home Check-Ins FAQ</h2>
          <p className="subheading">
            Clear answers to the most common questions about my one-on-one home
            visits — so you can feel confident knowing your dog is supported and safe.
          </p>
        </div>

        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
};

export default FaqSection;
