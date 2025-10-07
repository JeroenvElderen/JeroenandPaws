import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What are Group Adventures?",
      answer:
        "Group Adventures are fun, safe outdoor outings where a small group of friendly dogs — including mine — explore and play together. Each group is carefully matched so every dog feels comfortable and included.",
    },
    {
      question: "How many dogs join each adventure?",
      answer:
        "I keep groups small, usually just a few dogs at a time. This way, everyone gets plenty of attention, stays safe, and can enjoy meeting new friends without feeling overwhelmed.",
    },
    {
      question: "Can my shy or high-energy dog join?",
      answer:
        "Yes! I get to know each dog’s personality and energy level before matching them with a group. Shy pups can build confidence at their own pace, while energetic dogs can have safe, playful fun.",
    },
    {
      question: "Where do the adventures take place?",
      answer:
        "We go to safe and stimulating outdoor spots — scenic trails, parks, or open spaces where the dogs can sniff, play, and enjoy nature together.",
    },
    {
      question: "Will I get updates about the adventure?",
      answer:
        "Absolutely! After each adventure, you’ll get photos and a quick note about your dog’s day — new friends made, fun moments, and how they enjoyed the outing.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Group Adventures FAQ</h2>
          <p className="subheading">
            Everything you need to know about my small, safe, and social group
            outings — where dogs explore, play, and make friends.
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
