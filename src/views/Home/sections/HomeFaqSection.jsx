import React, { useState, useCallback } from "react";

const faqs = [
  {
    question: "What services do you offer for dogs?",
    answer:
      "We provide training, walking, boarding, and day care. Our services are tailored to meet the unique needs of each dog, ensuring they receive the best care possible.",
  },
  {
    question: "How experienced are you with dog care?",
    answer:
      "I have over 7 years of experience and a certification in Animal Care. My background includes working with police, sled, and guide dogs.",
  },
  {
    question: "What makes your services unique?",
    answer:
      "I offer a compassionate, personalized approach to each dog's care. Every dog is treated like family, ensuring they feel happy and secure.",
  },
  {
    question: "Can you accommodate special needs?",
    answer:
      "Yes, I tailor my methods to fit each dog's individual needs. Whether it's training or day care, I ensure a safe and loving environment.",
  },
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
          <h2>Welcome to your dog&apos;s second home</h2>
          <p className="subheading">
            Discover our personalized care and training services for your furry
            friend.
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
