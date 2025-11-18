import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is a Solo Journey?",
      answer:
        "A Solo Journey is a fully personalized outdoor adventure — just me and your dog. Each outing is designed around your pup’s personality and energy level, from peaceful sniffing strolls to longer, more active walks.",
    },
    {
      question: "Who are Solo Journeys best for?",
      answer:
        "They’re perfect for dogs who prefer one-on-one attention, are shy around other dogs, need a calm environment, or have special needs that make group outings less ideal.",
    },
    {
      question: "Can you adjust the pace and distance?",
      answer:
        "Absolutely. I adapt every journey to your dog’s comfort — slow and steady for sniffers or seniors, longer and faster for energetic explorers. Your dog sets the rhythm.",
    },
    {
      question: "Will I get updates during the journey?",
      answer:
        "Yes! You’ll receive photos and a quick note so you can see how your pup is doing and enjoy peace of mind while they’re out adventuring.",
    },
    {
      question: "Can you give medication or follow special instructions?",
      answer:
        "Of course. I can handle medication timing, extra breaks, and any details that help keep your dog comfortable and safe on their solo outing.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Solo Journey FAQ</h2>
          <p className="subheading">
            Everything you need to know about my one-on-one adventures — fully
            personalized for your dog’s comfort, safety, and happiness.
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
