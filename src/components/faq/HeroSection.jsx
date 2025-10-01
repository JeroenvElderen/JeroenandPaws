import { useState } from 'react';

const HERO_FAQS = [
  {
    question: 'What training methods do you use?',
    answer:
      'Every dog is unique, so I use positive, balanced training tailored to your dog’s needs. My approach is gentle, consistent, and always focused on building trust and confidence.',
  },
  {
    question: 'How do walks and visits work?',
    answer:
      'Walks and drop-ins are flexible—choose from 30, 45, or 60 minutes. I make sure your dog gets exercise, enrichment, and plenty of attention, whether it’s a quick stroll or a longer adventure.',
  },
  {
    question: 'Is boarding or day care right for my dog?',
    answer:
      'Boarding and day care offer a safe, structured, and fun environment. Your dog will enjoy playtime, rest, and personalized care, just like they would at home.',
  },
  {
    question: 'Can you handle special needs or routines?',
    answer:
      'Absolutely! I’m experienced with dogs of all ages, breeds, and temperaments—including those with special needs. Just let me know your dog’s routine, and I’ll make sure they feel comfortable and secure.',
  },
];

const FAQHeroSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle(index);
    }
  };

  return (
    <section data-copilot="true" className="section">
      <div className="container is-small">
        <div
          id="w-node-_1b9fe946-f76f-93ba-3eaa-8c8d6d52a282-6d52a280"
          className="header is-align-center w-node-ac52873d-5748-0aed-3d44-55d4506b6066-d19277d5"
        >
          <h2>Care for every wagging tail</h2>
          <p className="subheading">Expert dog training, walks, and loving care—tailored for your best friend.</p>
        </div>
        <div
          id="w-node-_1b9fe946-f76f-93ba-3eaa-8c8d6d52a287-6d52a280"
          className="flex_vertical w-node-ac52873d-5748-0aed-3d44-55d4506b609d-d19277d5"
        >
          {HERO_FAQS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                data-delay="0"
                data-hover="false"
                className={`accordion is-transparent w-dropdown ${isOpen ? 'w--open' : ''}`}
              >
                <div
                  className="accordion_toggle-transparent w-dropdown-toggle"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => handleToggle(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="accordion_icon w-icon-dropdown-toggle"></div>
                  <div className="paragraph_large margin-bottom_none">{item.question}</div>
                </div>
                <nav
                  className="accordion_content w-dropdown-list"
                  style={{ display: isOpen ? 'block' : 'none' }}
                >
                  <div className="padding_xsmall padding-horizontal_none">
                    <div className="rich-text w-richtext">
                      <p>{item.answer}</p>
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

export default FAQHeroSection;