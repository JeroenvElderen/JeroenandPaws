import React, { useState, useCallback } from "react";

const faqs = [
  {
    question: "What services do you offer for dogs?",
    answer:
      "We provide walking, training, day care, and boarding services, each shaped around your companion’s unique personality and needs. Our goal is to create a caring, reliable experience every step of the way.",
  },
  {
    question: "How experienced are you with dog care?",
    answer:
      "With over seven years of hands-on experience and formal certification in Animal Care, my background spans working with police, sled, and guide companions — giving me a deep understanding of diverse needs, temperaments, and training styles.",
  },
  {
    question: "What makes your approach different?",
    answer:
      "I take a genuinely personal approach to every companion I work with. Here, no one is just another booking — each companion is treated like family, welcomed into a caring space where they feel safe, supported, and understood.",
  },
  {
    question: "Can you accommodate dogs with special requirements?",
    answer:
      "Absolutely. Whether your companion needs extra guidance, reassurance, or a particular routine, I adapt my approach to suit them. Every experience is designed to feel safe, calm, and comfortable.",
  },
  {
    question: "How do you keep dogs safe during walks and playtime?",
    answer:
    "Safety is my priority. I use secure equipment, stay attentive to surroundings, and introduce companions to group activities gradually, ensuring they feel confident and protected at all times."
  },
  {
    question: "Do you meet dogs before their first booking?",
    answer: 
    "Yes. I offer an introductory meet-and-greet so we can get to know each other. It helps me understand your companion’s personality and ensures they feel comfortable from the very beginning."
  },
  {
    question: "What should I bring for day care or boarding?",
    answer:
    "Their favourite food, any medication, and a familiar item — such as a blanket or toy — help make their stay feel like home."
  },
  {
    question: "How do you handle nervous or anxious dogs?",
    answer:
    "With patience, calm communication, and thoughtful pacing. I build trust step by step, helping anxious companions feel safe, seen, and supported."
  }
];

const HomeFaqSection = () => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleItem = useCallback((index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  }, []);

  const handleKeyDown = useCallback(
    (event, index) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleItem(index);
      }
    },
    [toggleItem]
  );

  return (
    <section data-copilot="true" className="section">
      <div className="container is-small">
        <div
          id="w-node-_1b9fe946-f76f-93ba-3eaa-8c8d6d52a282-6d52a280"
          className="header is-align-center w-node-e5c63cf8-d464-4b5c-779f-87db4b792fc8-055fd1ce"
        >
          <h2>Welcome to your companion’s second home</h2>
          <p className="subheading">
            Explore our personalised care and training services, thoughtfully designed to support your beloved companion.
          </p>
        </div>
        <div
          id="w-node-_1b9fe946-f76f-93ba-3eaa-8c8d6d52a287-6d52a280"
          className="flex_vertical w-node-e5c63cf8-d464-4b5c-779f-87db4b792ff1-055fd1ce"
        >
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                key={question}
                data-delay="0"
                data-hover="false"
                className={`accordion is-transparent w-dropdown${
                  isOpen ? " w--open" : ""
                }`}
              >
                <div
                  className={`accordion_toggle-transparent w-dropdown-toggle${
                    isOpen ? " w--open" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => toggleItem(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <div className="accordion_icon w-icon-dropdown-toggle"></div>
                  <div className="paragraph_large margin-bottom_none">
                    {question}
                  </div>
                </div>
                <nav
                  className={`accordion_content w-dropdown-list${
                    isOpen ? " w--open" : ""
                  }`}
                  aria-hidden={!isOpen}
                >
                  <div className="padding_xsmall padding-horizontal_none">
                    <div className="rich-text w-richtext">
                      <p>{answer}</p>
                    </div>
                  </div>
                </nav>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeFaqSection;
