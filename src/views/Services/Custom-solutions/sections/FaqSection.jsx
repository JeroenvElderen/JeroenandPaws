import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What services do you offer for dogs?",
      answer:
        "We offer personalised dog training, daily walks, day care, boarding, and home visits. Every service is shaped around your dog’s personality, routine, and needs — so they always feel understood and supported.",
    },
    {
      question: "How do you handle different dog personalities?",
      answer:
        "Dogs communicate in their own ways, so I adjust my approach to match their energy and comfort level. Whether confident, sensitive, playful, or cautious — every dog is met with patience, understanding, and respect.",
    },
    {
      question: "Can you care for special needs or senior dogs?",
      answer:
        "Absolutely. I have experience supporting senior dogs, reactive dogs, and those with medical or behavioural needs. With clear routines and gentle care, your dog can feel safe, relaxed, and well looked after.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Care that feels like home for your dog</h2>
          <p className="subheading">
            Your questions answered — from training and walks to tailored care and daily routines.
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
