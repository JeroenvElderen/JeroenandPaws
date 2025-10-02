import { useState } from 'react';

export function FaqItem({ faq }) {
  const { question, answer } = faq;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="faq-question"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className="faq-indicator" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && <p className="faq-answer">{answer}</p>}
    </div>
  );
}
