import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

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

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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

        <div className="flex_vertical is_align-center-flex">
          {faqs.map((faq, index) => (
            <div className="accordion is-transparent" key={index}>
              <button
                className="accordion_toggle-transparent"
                onClick={() => toggleAccordion(index)}
              >
                <div className="accordion_icon">
                  {activeIndex === index ? "−" : "+"}
                </div>
                <div className="paragraph_large margin-bottom_none text-center">
                  {faq.question}
                </div>
              </button>
              {activeIndex === index && (
                <div className="accordion_content">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
