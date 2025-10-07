import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What services do you offer for dogs?",
      answer:
        "We provide personalized dog training, daily walks (from 30 minutes to custom durations), boarding, day care, and drop-in visits. Every service is tailored to your dog’s unique needs.",
    },
    {
      question: "How do you handle different dog personalities?",
      answer:
        "With years of experience and a background in animal care, I adapt my approach to each dog — whether energetic, shy, or somewhere in between.",
    },
    {
      question: "Can you care for special needs or senior dogs?",
      answer:
        "Absolutely! I have experience with dogs of all ages and abilities, including those needing medication, extra patience, or special routines.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Your Dog’s Second Home</h2>
          <p className="subheading">
            Everything you need to know about our dog care, training, and daily adventures—answered for you below.
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
