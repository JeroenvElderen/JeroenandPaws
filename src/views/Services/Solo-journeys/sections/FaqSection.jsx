import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is a Solo Journey?",
      answer:
        "A Solo Journey is a one-to-one outdoor outing tailored to your dog’s pace, confidence, and interests. It is dedicated time for exploration, movement, and calm focus without the distractions of a group walk.",
    },
    {
      question: "Who benefits most from a Solo Journey?",
      answer:
        "Solo Journeys suit dogs who enjoy individual attention, feel overwhelmed in groups, need a calmer experience, or have routines, sensitivities, or behaviours that require a more personal approach.",
    },
    {
      question: "Can you adapt the pace and distance?",
      answer:
        "Yes. Every journey follows your dog’s natural rhythm — from slow, scent-led strolls to more active outings. The pace and distance are always adjusted to what feels right for them.",
    },
    {
      question: "Will I receive updates during the outing?",
      answer:
        "Yes. You will receive photographs and a short message during or after the outing so you always know how your dog is getting on.",
    },
    {
      question: "Can you follow routines or give medication?",
      answer:
        "Yes. I can follow feeding routines, offer breaks when needed, and administer medication as instructed to keep your dog comfortable and supported.",
    },
    {
      question: "How long is a Solo Journey?",
      answer:
        "Journeys vary depending on the option you choose. They range from a few hours to a full day, with time built in for rest, exploration, and individual attention.",
    },
    {
      question: "Do you pick up and drop off my dog?",
      answer:
        "Yes. I collect your dog from home and bring them back after the outing, making the experience simple and stress-free for you.",
    },
    {
      question: "Can nervous dogs take part?",
      answer:
        "Yes. Many nervous or unsure dogs benefit greatly from one-on-one outings. Going at their pace helps build confidence without the pressure of a group setting.",
    },
    {
      question: "What should my dog bring?",
      answer:
        "Just a secure harness and anything specific they may need, such as medication or preferred treats. Fresh water and essentials are provided.",
    },
    {
      question: "Is there an introduction before the first journey?",
      answer:
        "Yes. A brief meet-and-greet helps your dog get to know me, ensures they feel comfortable, and allows us to discuss expectations and routines.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Solo Journeys — Frequently Asked Questions</h2>
          <p className="subheading">
            Clear answers about individual, one-to-one outings designed for dogs
            who benefit from calm focus, steady attention, and room to explore at
            their own pace.
          </p>
        </div>

        <div className="flex_vertical">
          {faqs.map((faq, index) => (
            <div className="accordion is-transparent" key={index}>
              <button
                className="accordion_toggle-transparent"
                onClick={() => toggleAccordion(index)}
              >
                <div className="accordion_icon">
                  {activeIndex === index ? "−" : "+"}
                </div>
                <div className="paragraph_large margin-bottom_none">
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
