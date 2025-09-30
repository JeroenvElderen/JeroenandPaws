import highlights from '../data/highlights.js';
import '../styles/components/highlights.css';

function Highlights() {
  return (
    <section className="highlights" aria-labelledby="highlights-heading">
      <div>
        <span className="hero__eyebrow">Why families choose us</span>
        <h2 id="highlights-heading">Welcome to your dog&apos;s second home</h2>
      </div>
      <div className="highlights__grid">
        {highlights.map((item) => (
          <article className="highlight-card" key={item.id}>
            <img src={item.image} alt="" aria-hidden />
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <ul>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {item.cta ? (
              <a className="highlight-card__cta" href={item.cta.href}>
                {item.cta.label}
                <span aria-hidden>→</span>
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default Highlights;
