import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What does a typical day of daycare look like?",
      answer:
        "Your dog spends the day with me — no big groups, just safe, personal care and attention. We play, go for potty breaks, have rest time, and keep a calm, happy routine tailored just for your pup.",
    },
    {
      question: "Is the daycare one-on-one?",
      answer:
        "Yes! I care for one dog (or dogs from the same household) at a time. This means your pup gets my full attention and a stress-free environment — no overcrowded playrooms or chaotic groups.",
    },
    {
      question: "Do you accept puppies or senior dogs?",
      answer:
        "Absolutely. Puppies get extra potty breaks and play sessions, while seniors enjoy a gentle pace, comfy rest spots, and patient care that respects their needs.",
    },
    {
      question: "Will I get updates during the day?",
      answer:
        "Of course — I’ll send you little updates and photos so you know how your pup is doing and can relax while you’re away.",
    },
    {
      question: "What should I bring for daycare?",
      answer:
        "Please bring your dog’s essentials — their leash, food or treats if needed, and anything comforting like a favorite toy or blanket. I’ll take care of the rest.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Daycare Questions Answered</h2>
          <p className="subheading">
            Here’s everything you might want to know about my one-on-one dog
            daycare — so you can feel confident leaving your best friend with me.
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
