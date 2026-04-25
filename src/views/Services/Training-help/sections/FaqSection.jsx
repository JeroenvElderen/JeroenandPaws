import React from "react";
import FaqAccordion from "../../../../components/faq/FaqAccordion";

const FaqSection = () => {

  const faqs = [
    {
      question: "What types of dog training do you offer?",
      answer:
        "I provide private obedience training, leash manners, puppy socialization, behavior modification for issues like barking or jumping, and confidence-building sessions for anxious dogs.",
    },
    {
      question: "How long does it take to see training results?",
      answer:
        "Most dogs begin showing improvements within 1–2 sessions. Consistency between sessions and at home is key, so I provide easy exercises you can practice daily.",
    },
    {
      question: "Do you work with reactive or anxious dogs?",
      answer:
        "Absolutely. I specialize in helping dogs who struggle with fear, reactivity, or overstimulation. Training remains positive, patient, and customized to your dog’s comfort level.",
    },
    {
      question: "Can you train puppies?",
      answer:
        "Yes! Puppy sessions include potty training support, crate guidance, socialization exercises, and foundational commands to build great behavior from day one.",
    },
    {
      question: "What methods do you use?",
      answer:
        "I use force-free, reward-based training rooted in science and respect. This approach builds trust, reduces stress, and creates long-lasting behavior change.",
    },
  ];

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Training That Transforms Your Dog</h2>
          <p className="subheading">
            Whether you're struggling with jumping, reactivity, leash pulling,
            or puppy manners, these FAQs explain how my training approach helps
            build calm, confident, well-behaved dogs.
          </p>
        </div>

        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
};

export default FaqSection;
