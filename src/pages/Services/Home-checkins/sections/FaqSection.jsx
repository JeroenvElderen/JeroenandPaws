import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What’s included in a home check-in?",
      answer:
        "Each visit is personal and tailored to your dog’s needs — fresh water, feeding if required, potty breaks, playtime, and plenty of love. You’ll get an update and a photo so you know your pup is happy and safe.",
    },
    {
      question: "Are check-ins one-on-one?",
      answer:
        "Yes! I’m a solo pet carer, so your dog always has my full attention during each visit — no rushing or juggling other clients.",
    },
    {
      question: "Can you handle special routines or medication?",
      answer:
        "Absolutely. I can follow your feeding schedule, give medication, and keep your dog’s routine consistent to reduce stress while you’re away.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Home Check-Ins FAQ</h2>
          <p className="subheading">
            Everything you need to know about my one-on-one home visits — so you
            can feel confident leaving your best friend in safe hands.
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
