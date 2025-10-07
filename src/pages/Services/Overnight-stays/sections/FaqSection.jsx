import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Where will my dog stay?",
      answer:
        "Your dog will stay in my cozy home alongside my two friendly, well-socialized dogs. It’s a calm, safe environment — no crowded kennels, just a comfortable space where your pup can feel part of the family.",
    },
    {
      question: "How do you help dogs feel comfortable?",
      answer:
        "I keep your dog’s daily routine as familiar as possible — from mealtimes to walks and sleep spots. They’ll get plenty of attention, play, and quiet time, so they feel safe and settled.",
    },
    {
      question: "Can you board dogs with special needs or seniors?",
      answer:
        "Absolutely! I’m experienced with dogs of all ages and abilities, including those needing medication, extra patience, or gentle routines. Just share your pup’s needs, and I’ll make sure they’re comfortable.",
    },
    {
      question: "Will my dog get along with your dogs?",
      answer:
        "Yes — I carefully introduce new dogs to my two friendly pups to make sure everyone feels safe and comfortable. If your dog prefers space, I can easily manage separate rest areas and downtime.",
    },
    {
      question: "Will I get updates while I’m away?",
      answer:
        "Definitely! I’ll send you daily photos and notes about how your dog is doing — meals, walks, playtime, and cozy naps — so you can travel worry-free.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Boarding FAQ</h2>
          <p className="subheading">
            Everything you need to know about leaving your pup with me — safe, loving overnight care in a real home.
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
