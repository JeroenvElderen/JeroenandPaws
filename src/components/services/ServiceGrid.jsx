import { ServiceCard } from './ServiceCard';

export function ServiceGrid({ services, title = 'Services' }) {
  if (!services?.length) {
    return null;
  }

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-heading">
          <h2>{title}</h2>
          <p>Explore the tailored support options available for you and your pet.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
