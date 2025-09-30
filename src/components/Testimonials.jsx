import testimonials from '../data/testimonials.js';
import '../styles/components/testimonials.css';

function Testimonials() {
  return (
    <section className="testimonials" aria-labelledby="testimonials-heading">
      <div>
        <span className="hero__eyebrow">Loved by pet parents</span>
        <h2 id="testimonials-heading">Stories from our community</h2>
      </div>
      <div className="testimonials__grid">
        {testimonials.map((testimonial) => (
          <article className="testimonial-card" key={testimonial.id}>
            <div className="testimonial-card__header">
              <span className="testimonial-card__avatar">
                <img src={testimonial.avatar} alt="" aria-hidden />
              </span>
              <span className="testimonial-card__details">
                <span>{testimonial.name}</span>
                <span>{testimonial.role}</span>
              </span>
            </div>
            <p>&ldquo;{testimonial.quote}&rdquo;</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
