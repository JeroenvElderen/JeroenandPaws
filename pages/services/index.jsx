import Link from 'next/link';

const services = [
  {
    path: '/services/daily-strolls',
    label: 'Daily strolls',
    description: 'Calm, enriching neighborhood walks with plenty of sniff time.',
  },
  {
    path: '/services/group-adventures',
    label: 'Group adventures',
    description: 'Social hikes and park play with carefully matched pups.',
  },
  {
    path: '/services/solo-journeys',
    label: 'Solo journeys',
    description: 'One-on-one outings for pups who prefer a quieter pace.',
  },
  {
    path: '/services/overnight-stays',
    label: 'Overnight & multi-day',
    description: 'Cozy, in-home boarding with bedtime routines from home.',
  },
  {
    path: '/services/daytime-care',
    label: 'Daytime care',
    description: 'Structured daytime hangs with breaks for play and rest.',
  },
  {
    path: '/services/home-check-ins',
    label: 'Home check-ins',
    description: 'Quick visits for meals, meds, and a reassuring hello.',
  },
  {
    path: '/services/training-help',
    label: 'Training help',
    description: 'Reinforcement walks and support for your training goals.',
  },
  {
    path: '/services/custom-solutions',
    label: 'Custom solutions',
    description: 'A tailored plan for unique schedules, needs, or behaviors.',
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
          <div className="hero-card__title">Weekend adventures</div>
          <p className="hero-card__meta">New routes, long sniffs, happy naps after.</p>
          <div className="hero-card__cta">See the full lineup below</div>
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
              <div className="service-card__actions">
                <Link href={service.path} className="service-card__button">
                  View service
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
        gap: 1rem;
      }

      .service-card {
        display: grid;
        gap: 0.85rem;
        padding: 1.1rem;
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: inherit;
        position: relative;
        overflow: hidden;
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
      }

      .service-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(124, 211, 255, 0.18), rgba(133, 109, 255, 0.12));
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
        transform: translateY(-4px);
        border-color: rgba(121, 208, 255, 0.35);
        background: rgba(255, 255, 255, 0.06);
        box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
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

      .service-card__actions {
        display: flex;
        justify-content: flex-start;
      }

      .service-card__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.65rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: #f8f7ff;
        color: #0f1024;
        font-weight: 700;
        text-decoration: none;
        min-width: 130px;
        transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
      }

      .service-card__button:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        background: #ffffff;
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
