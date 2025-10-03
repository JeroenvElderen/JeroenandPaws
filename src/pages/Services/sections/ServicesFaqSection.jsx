import React, { useEffect, useMemo, useState } from 'react';

const FALLBACK_FAQS = [
  {
    id: 'services-faq-1',
    question: 'What services do you offer for dogs?',
    answer:
      'We provide training, walking, boarding, and day care tailored to each dog. Every plan is customised to support their needs and your schedule.',
  },
  {
    id: 'services-faq-2',
    question: 'Can you personalise care for my dog?',
    answer:
      'Absolutely. From medication schedules to training goals, we partner with you to design a routine that works for your dog.',
  },
  {
    id: 'services-faq-3',
    question: 'How do bookings work?',
    answer:
      'Choose the service that fits best, submit a booking request, and we will confirm availability and next steps right away.',
  },
];

const ServicesFaqSection = ({ faqs = [] }) => {
  const [openItem, setOpenItem] = useState(null);
  const entries = useMemo(() => (faqs.length > 0 ? faqs : FALLBACK_FAQS), [faqs]);

  useEffect(() => {
    if (!entries.length) {
      setOpenItem(null);
      return;
    }

    if (!entries.some((item) => (item.id || item.question) === openItem)) {
      setOpenItem(null);
    }
  }, [entries, openItem]);

  if (entries.length === 0) {
    return null;
  }

  const toggleItem = (id) => {
    setOpenItem((current) => (current === id ? null : id));
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Frequently asked questions</h2>
          <p className="subheading">Answers to help you plan the best care for your dog.</p>
        </div>
        <div className="flex_vertical">
          {entries.map((faq) => {
            const id = faq.id || faq.question;
            const isOpen = openItem === id;
            const summaryText = faq.summary || (faq.answer ? faq.answer.split('\n')[0] : '');

            return (
              <div key={id} className={`accordion is-transparent${isOpen ? ' w--open' : ''}`}>
                <button
                  type="button"
                  className="accordion_toggle-transparent w-dropdown-toggle"
                  onClick={() => toggleItem(id)}
                  aria-expanded={isOpen}
                >
                  <div className="accordion_icon w-icon-dropdown-toggle">{faq.question}</div>
                  {summaryText && (
                    <div className="paragraph_large margin-bottom_none">{summaryText}</div>
                  )}
                </button>
                {isOpen && (
                  <div className="accordion_content w-dropdown-list">
                    <div className="padding_xsmall padding-horizontal_none">
                      <div className="rich-text w-richtext">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesFaqSection;
