import '../styles/components/hero.css';

const STATS = [
  { label: 'Families served this year', value: '420+' },
  { label: 'Average photo updates per stay', value: '12' },
  { label: 'Certified carers on the team', value: '18' }
];

function Hero() {
  return (
    <section className="hero" id="about">
      <div>
        <span className="hero__eyebrow">Caring since 2014</span>
        <h1>Caring for your pet with expertise and love</h1>
        <p>
          Whether it&apos;s personalised training, a fun-filled daycare, or a cosy sleepover, our team creates
          enriching days and peaceful nights. Count on us for attentive updates, professional handling, and
          tail-wagging adventures.
        </p>
        <div className="hero__cta">
          <a className="button button--primary" href="#contact">
            Book a meet & greet
          </a>
          <a className="button button--ghost" href="#services">
            Explore services
          </a>
        </div>
        <div className="hero__stat-block">
          {STATS.map((stat) => (
            <div className="hero__stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero__image">
        <img src="/images/d1c5edae-66f0-4727-a854-02ccbbab7dc4.avif" alt="Reception area of a welcoming pet care studio" />
        <div className="hero__badge">
          <span>Pet parents say</span>
          <span>“Peace of mind, every time.”</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
