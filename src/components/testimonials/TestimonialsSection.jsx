export function TestimonialsSection({ testimonials }) {
  if (!testimonials?.length) {
    return null;
  }

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-heading">
          <h2>Loved by pet parents</h2>
          <p>Real stories from families who worked with Jeroen &amp; Paws.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.id}>
              {testimonial.avatar_url && (
                <img
                  className="testimonial-avatar"
                  src={testimonial.avatar_url}
                  alt={testimonial.name}
                />
              )}
              <blockquote>
                <p>“{testimonial.quote}”</p>
              </blockquote>
              <p className="testimonial-author">
                {testimonial.name}
                {testimonial.role && <span className="testimonial-role">, {testimonial.role}</span>}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
