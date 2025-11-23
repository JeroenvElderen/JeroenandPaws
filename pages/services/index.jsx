import Link from 'next/link';

const services = [
  {
    path: '/services/daily-strolls',
    label: 'Daily strolls',
    description: 'Calm, enriching neighborhood walks with plenty of sniff time.',
    meta: '30-60 minutes · solo or paired',
    cta: 'Explore daily strolls',
  },
  {
    path: '/services/group-adventures',
    label: 'Group adventures',
    description: 'Social hikes and park play with carefully matched pups.',
    meta: 'Small curated groups',
    cta: 'Explore group adventures',
  },
  {
    path: '/services/solo-journeys',
    label: 'Solo journeys',
    description: 'One-on-one outings for pups who prefer a quieter pace.',
    meta: 'Quiet neighborhoods · extra patience',
    cta: 'Explore solo journeys',
  },
  {
    path: '/services/overnight-stays',
    label: 'Overnight & multi-day',
    description: 'Cozy, in-home boarding with bedtime routines from home.',
    meta: 'Sleepovers · extended stays',
    cta: 'Explore overnight stays',
  },
  {
    path: '/services/daytime-care',
    label: 'Daytime care',
    description: 'Structured daytime hangs with breaks for play and rest.',
    meta: 'Play + rest rhythm',
    cta: 'Explore daytime care',
  },
  {
    path: '/services/home-check-ins',
    label: 'Home check-ins',
    description: 'Quick visits for meals, meds, and a reassuring hello.',
    meta: '15-30 minutes · meds welcome',
    cta: 'Explore home check-ins',
  },
  {
    path: '/services/training-help',
    label: 'Training help',
    description: 'Reinforcement walks and support for your training goals.',
    meta: 'Fear-free handling',
    cta: 'Explore training help',
  },
  {
    path: '/services/custom-solutions',
    label: 'Custom solutions',
    description: 'A tailored plan for unique schedules, needs, or behaviors.',
    meta: 'Flexible & collaborative',
    cta: 'Explore custom solutions',
  },
];

const careHighlights = [
  {
    title: 'Fear-free first',
    description: 'Gentle handling, decompression time, and consent-based care in every outing.',
  },
  {
    title: 'Thoughtful pacing',
    description: 'Routes and play styles matched to your dog’s mood, mobility, and preferences.',
  },
  {
    title: 'Transparent updates',
    description: 'GPS logs, photos, and real-talk notes so you always know how the day went.',
  },
];

const ServicesIndexPage = () => (
  <main className="services-page">
    <section className="services-hero">
      <div className="container services-hero__inner">
        <div className="hero-copy">
          <div className="eyebrow">Tailored care, every step of the way</div>
          <h1 className="heading_h2">Our services</h1>
          <p className="paragraph_large text-color_secondary">
            Explore experiences designed to match your dog’s personality and your schedule.
          </p>
          <div className="hero-tags">
            <span className="pill">Fear-free handling</span>
            <span className="pill">Small ratios</span>
            <span className="pill">Transparent updates</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="badge">Most loved</div>
          <div className="hero-card__title">30-minute daily strolls</div>
          <p className="hero-card__meta">Unhurried neighborhood walks with plenty of sniff time.</p>
          <div className="hero-card__cta">See the full lineup below</div>
          
          <div className="hero-card__highlights">
            <div className="hero-chip">
              <span className="dot dot--primary" />
              Enrichment focused
            </div>
            <div className="hero-chip">
              <span className="dot dot--accent" />
              Small ratios only
            </div>
            <div className="hero-chip">
              <span className="dot dot--soft" />
              Weather-ready plans
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="care-pillars">
      <div className="container">
        <div className="section-header section-header--stacked">
          <p className="overline">How we show up</p>
          <h2 className="heading_h3">Care that feels like a warm hug</h2>
          <p className="paragraph_small text-color_secondary">
            Everything we do ladders up to a calmer, happier pup and a more confident pet parent.
          </p>
        </div>

        <div className="pillars-grid">
          {careHighlights.map((item) => (
            <article key={item.title} className="pillar-card">
              <div className="pillar-card__glow" />
              <div className="pillar-card__icon" aria-hidden>
                <span className="dot dot--primary" />
              </div>
              <div className="pillar-card__body">
                <h3 className="heading_h5">{item.title}</h3>
                <p className="paragraph_small text-color_secondary">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="services-grid-section">
      <div className="container">
        <div className="section-header">
          <p className="overline">Pick your perfect fit</p>
          <p className="paragraph_small text-color_secondary">
            Each service is crafted to keep pups confident, engaged, and safe.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <article key={service.path} className="service-card">
              <div className="service-card__header">
                <div className="service-card__label">Service</div>
                <div className="heading_h5 margin-bottom_none">{service.label}</div>
              </div>
              <p className="paragraph_small text-color_secondary">{service.description}</p>
              <div className="service-card__meta">{service.meta}</div>
              <div className="service-card__actions">
                <Link
                  href={service.path}
                  className="service-card__button"
                  aria-label={`Go to ${service.label}`}
                >
                  <span className="service-card__button-glow" aria-hidden />
                  <span className="service-card__button-label">{service.cta}</span>
                  <span className="service-card__button-icon" aria-hidden>
                    ↗
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <style jsx>{`
      .services-page {
        background: radial-gradient(120% 120% at 20% 20%, rgba(125, 110, 255, 0.12), transparent 50%),
          radial-gradient(90% 90% at 80% 0%, rgba(110, 210, 255, 0.12), transparent 55%),
          #0f1024;
        min-height: 100vh;
        color: #f8f7ff;
        padding-bottom: 4rem;
      }

      .services-hero {
        padding: 4rem 0 1rem;
      }

      .services-hero__inner {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
        gap: 2rem;
        align-items: stretch;
      }

      .hero-copy h1 {
        color: #fff;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #c9c4ff;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-size: 0.8rem;
        margin-bottom: 0.75rem;
      }

      .hero-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin-top: 1.5rem;
      }

      .pill {
        padding: 0.5rem 0.9rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #f0eeff;
        font-size: 0.9rem;
      }

      .hero-card {
        border-radius: 1.25rem;
        background: linear-gradient(145deg, rgba(133, 109, 255, 0.4), rgba(73, 198, 255, 0.2));
        border: 1px solid rgba(255, 255, 255, 0.16);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        backdrop-filter: blur(6px);
      }

      .badge {
        align-self: flex-start;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: rgba(15, 16, 36, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.12);
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .hero-card__title {
        font-size: 1.35rem;
        font-weight: 700;
      }

      .hero-card__meta {
        margin: 0;
        color: rgba(248, 247, 255, 0.8);
      }

      .hero-card__cta {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: 600;
        color: #0f1024;
        background: #f7f5ff;
        border-radius: 999px;
        padding: 0.6rem 0.9rem;
        width: fit-content;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }

      .hero-card__highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }

      .hero-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        background: rgba(15, 16, 36, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.12);
        font-weight: 600;
        color: #f8f7ff;
      }

      .dot {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
        display: inline-block;
      }

      .dot--primary {
        background: linear-gradient(135deg, #a68cff, #7bd6ff);
      }

      .dot--accent {
        background: linear-gradient(135deg, #ffc56f, #ff8fb1);
      }

      .dot--soft {
        background: linear-gradient(135deg, #a3ffce, #63b0ff);
      }

      .services-grid-section {
        padding: 2rem 0 4rem;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .section-header--stacked {
        flex-direction: column;
        align-items: flex-start;
      }

      .overline {
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #c9c4ff;
        margin: 0;
        font-weight: 700;
      }

      .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.25rem;
      }

      .service-card {
        display: grid;
        gap: 0.85rem;
        padding: 1.1rem;
        border-radius: 1rem;
        background: radial-gradient(circle at 20% 20%, rgba(166, 140, 255, 0.12), transparent 35%),
          radial-gradient(circle at 85% 10%, rgba(123, 214, 255, 0.1), transparent 40%),
          linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: inherit;
        position: relative;
        overflow: hidden;
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
      }

      .service-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(124, 211, 255, 0.16), rgba(124, 69, 243, 0.18));
        opacity: 0;
        transition: opacity 180ms ease;
      }

      .service-card::after {
        content: '';
        position: absolute;
        inset: 0.12rem;
        border-radius: 0.9rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        pointer-events: none;
      }

      .service-card:hover {
        transform: translateY(-5px);
        border-color: rgba(124, 69, 243, 0.5);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 22px 44px rgba(0, 0, 0, 0.32);
      }

      .service-card:hover::before {
        opacity: 1;
      }

      .service-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .service-card__label {
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.05);
        font-weight: 600;
        letter-spacing: 0.02em;
        font-size: 0.8rem;
      }

      .service-card p {
        margin: 0;
        line-height: 1.5;
      }

      .service-card__meta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #e6e4ff;
        font-weight: 700;
        width: fit-content;
        line-height: 1.2;
        margin: 0;
      }

      .service-card__actions {
        display: flex;
        justify-content: flex-start;
        margin-top: 0.25rem;
      }

      .service-card__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.65rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(164, 126, 247, 0.9);
        background: linear-gradient(120deg, var(--ai-gen-82921b10-4b39-48f0-b346-808cf4903d29-1759229239308---core-accent-color--accent-primary, #7c45f3),
            #9f7ff7);
        color: #fff;
        font-weight: 800;
        letter-spacing: 0.01em;
        text-decoration: none;
        min-width: 160px;
        box-shadow: 0 12px 30px rgba(124, 69, 243, 0.45);
        transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease;
        position: relative;
        overflow: hidden;
      }

      .service-card__button:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 32px rgba(124, 69, 243, 0.52);
        background: linear-gradient(120deg, #9f7ff7, var(--ai-gen-82921b10-4b39-48f0-b346-808cf4903d29-1759229239308---core-accent-color--accent-primary, #7c45f3));
        border-color: rgba(164, 126, 247, 0.95);
      }

      .service-card__button:focus-visible {
        outline: 2px solid rgba(164, 126, 247, 0.9);
        outline-offset: 3px;

      .service-card__button-glow {
        position: absolute;
        inset: -20%;
        background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.3), transparent 35%),
          radial-gradient(circle at 70% 50%, rgba(255, 255, 255, 0.25), transparent 35%);
        opacity: 0.65;
      }

      .service-card__button-label,
      .service-card__button-icon {
        position: relative;
        z-index: 1;
      }

      .service-card__button-icon {
        font-size: 1rem;
        line-height: 1;
      }

      .care-pillars {
        padding: 1rem 0 2rem;
      }

      .pillars-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .pillar-card {
        position: relative;
        padding: 1rem;
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.8rem;
        overflow: hidden;
        backdrop-filter: blur(6px);
      }

      .pillar-card__glow {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 10% 10%, rgba(123, 214, 255, 0.18), transparent 35%),
          radial-gradient(circle at 90% 80%, rgba(166, 140, 255, 0.14), transparent 40%);
        opacity: 0.9;
        pointer-events: none;
      }

      .pillar-card__icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: rgba(15, 16, 36, 0.55);
        display: grid;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.12);
        position: relative;
      }

      .pillar-card__body {
        position: relative;
        z-index: 1;
      }

      @media (max-width: 960px) {
        .services-hero__inner {
          grid-template-columns: 1fr;
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      @media (max-width: 600px) {
        .services-hero {
          padding: 3rem 0 0.5rem;
        }

        .services-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  </main>
);

export default ServicesIndexPage;
