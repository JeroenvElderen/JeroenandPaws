import React, { useState, useCallback } from 'react';

const faqs = [
  {
    question: "What training methods do you use?",
    answer:
      "Every dog learns differently, so I use positive, balanced training tailored to your dog's needs. My approach is gentle, confidence-building, and always focused on creating trust between you and your dog.",
  },
  {
    question: "How do walks and visits work?",
    answer:
      "Walks and home visits are flexible—choose 30, 45, or 60 minutes. Whether it's a relaxed stroll, structured enrichment, or a little extra company, your dog gets dedicated attention and care.",
  },
  {
    question: "Is boarding or day care right for my dog?",
    answer:
      "Boarding and day care provide a safe, structured, and loving environment. Dogs enjoy playtime, rest, and personalised care, making their stay feel as comfortable as home.",
  },
  {
    question: "Can you handle special needs or routines?",
    answer:
      "Absolutely. I work with dogs of all ages, breeds, temperaments, and abilities. Just share your dog's routine, medications, or quirks, and I’ll ensure they feel understood, safe, and secure.",
  },

  // NEW FAQS BELOW

  {
    question: "Do you offer meet-and-greets before bookings?",
    answer:
      "Yes. A meet-and-greet helps your dog get comfortable with me and gives us time to discuss their needs, habits, and preferences before any service begins.",
  },
  {
    question: "What should my dog bring for boarding or day care?",
    answer:
      "Please bring their regular food, any medication, and something familiar—such as a favourite blanket or toy—to help them settle in comfortably.",
  },
  {
    question: "How do you keep dogs safe during services?",
    answer:
      "Safety is my top priority. I use secure equipment, follow dog-safe routes, monitor behaviour carefully, and introduce dogs to new experiences at a pace they’re comfortable with.",
  },
  {
    question: "Do you accept reactive or anxious dogs?",
    answer:
      "Yes, I work with reactive, nervous, and shy dogs regularly. My calm approach, structured routines, and understanding of canine behaviour help them feel reassured and supported.",
  },
  {
    question: "Can my dog be walked off-lead?",
    answer:
      "Off-lead walks are possible once a dog demonstrates solid recall, calm behaviour, and I’ve gained your written permission. Until then, we prioritise safe, controlled on-lead adventures.",
  },
  {
    question: "How many dogs do you take at once?",
    answer:
      "Group sizes stay intentionally small so every dog receives attention and feels safe. Walks and day care groups are thoughtfully matched by temperament, age, and play style.",
  },
  {
    question: "Do you provide photo or text updates?",
    answer:
      "Yes. I send regular updates so you can enjoy peace of mind knowing how your dog is doing—whether they’re out on a walk, relaxing, or enjoying new experiences.",
  },
  {
    question: "Do you work with puppies?",
    answer:
      "Absolutely. Puppies need patience, structure, and plenty of positive experiences. I offer walks, socialisation support, and beginner training to help them grow into confident adults.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "I currently cover local neighbourhoods and surrounding areas. If you're unsure whether your address is included, just ask—I’m happy to confirm availability.",
  },
  {
    question: "How far in advance should I book?",
    answer:
      "Boarding and day care fill up quickly, especially on weekends and holidays. Booking early ensures your dog has a confirmed spot when you need it.",
  },
  {
    question: "What if my dog has medication or dietary needs?",
    answer:
      "That’s no problem. I’m experienced with medication schedules, dietary restrictions, and sensitive stomachs. Just provide clear instructions, and I’ll take care of the rest.",
  },
  {
    question: "Do you offer custom care plans?",
    answer:
      "Yes. Every dog is different, and some need a little more. If your dog has specific requirements or behaviours, I can create a tailored care plan just for them.",
  },
];


const FaqAccordionSection = () => {
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
      if (event.key === 'Enter' || event.key === ' ') {
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
          className="header is-align-center w-node-ac52873d-5748-0aed-3d44-55d4506b6066-d19277d5"
        >
          <h2>Expert care for dogs of every kind</h2>
          <p className="subheading">
            Expert dog training, walks, and loving care — tailored for your best friend.
          </p>
        </div>
        <div
          id="w-node-_1b9fe946-f76f-93ba-3eaa-8c8d6d52a287-6d52a280"
          className="flex_vertical w-node-ac52873d-5748-0aed-3d44-55d4506b609d-d19277d5"
        >
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                key={question}
                data-delay="0"
                data-hover="false"
                className={`accordion is-transparent w-dropdown${isOpen ? ' w--open' : ''}`}
              >
                <div
                  className={`accordion_toggle-transparent w-dropdown-toggle${isOpen ? ' w--open' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => toggleItem(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <div className="accordion_icon w-icon-dropdown-toggle"></div>
                  <div className="paragraph_large margin-bottom_none">{question}</div>
                </div>
                <nav
                  className={`accordion_content w-dropdown-list${isOpen ? ' w--open' : ''}`}
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

export default FaqAccordionSection;
