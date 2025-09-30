import services from '../data/services.js';
import '../styles/components/services.css';

function Services() {
  return (
    <section className="services" id="services" aria-labelledby="services-heading">
      <header className="services__header">
        <div>
          <span className="hero__eyebrow">Tailored care</span>
          <h2 id="services-heading">Everything your dog needs in one place</h2>
        </div>
        <p>
          Curate the right mix of daily walks, adventurous excursions, in-home boarding, or specialised wellness
          support. We keep pups happy while you keep life moving.
        </p>
      </header>
      <div className="services__grid">
        {services.map((service) => (
          <article className="service-card" key={service.id}>
            <img src={service.image} alt="" aria-hidden />
            <div className="service-card__body">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <ul>
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Services;
