import showcase from '../data/showcase.js';
import '../styles/components/showcase.css';

function Showcase() {
  return (
    <section className="showcase" id="faqs" aria-labelledby="showcase-heading">
      <div className="showcase__inner">
        <div className="showcase__text">
          <span className="hero__eyebrow">Plan with ease</span>
          <h2 id="showcase-heading">{showcase.heading}</h2>
          <p>{showcase.description}</p>
          <div className="showcase__actions">
            {showcase.actions.map((action) => (
              <a
                key={action.label}
                className={`button ${action.variant === 'ghost' ? 'button--ghost' : 'button--primary'}`}
                href={action.href}
              >
                {action.label}
              </a>
            ))}
          </div>
          <div className="showcase__stats">
            {showcase.stats.map((stat) => (
              <div className="showcase__stat-card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="showcase__visual">
          <img src={showcase.image} alt="A bright and welcoming dog care space" />
          <div className="showcase__badge">
            <span>Average response time</span>
            <span>under 10 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Showcase;
