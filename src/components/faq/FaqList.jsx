import { FaqItem } from './FaqItem';

export function FaqList({ faqs, title = 'Frequently asked questions', id = 'faqs' }) {
  if (!faqs?.length) {
    return null;
  }

  return (
    <section className="section" id={id}>
      <div className="container">
        <div className="section-heading">
          <h2>{title}</h2>
          <p>Answers to the questions we hear most often.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
