import React, { useState } from "react";

const DailystrollsFaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What types of dog walks do you offer?",
      answer:
        "We offer flexible walk lengths — 30 minutes, 60 minutes, 120 minutes, and fully custom durations. Whether your pup needs a quick potty break or a big adventure, we’ve got it covered.",
    },
    {
      question: "Will my dog get one-on-one attention?",
      answer:
        "Yes! Walks are always individual (unless you request otherwise). Your dog gets our full focus, safe adventures, and plenty of sniff time.",
    },
    {
      question: "Can you handle high-energy or shy dogs?",
      answer:
        "Absolutely. Each walk is adapted to your dog’s personality — calm for nervous pups, playful and active for energetic explorers.",
    },
    {
      question: "What if it’s raining or the weather is bad?",
      answer:
        "We still walk! Safety always comes first, but a little rain won’t stop us. If weather becomes dangerous, we’ll discuss options with you.",
    },
    {
      question: "Can you walk senior dogs or those with special needs?",
      answer:
        "Yes, we adjust pace and distance to your dog’s comfort and can follow any special instructions (like medication timing or gentle routes).",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Dog Walking FAQ</h2>
          <p className="subheading">
            Everything you want to know about our walks — how we keep tails wagging and paws moving safely.
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

export default DailystrollsFaqSection;
