import { Link } from '../../router';

export function ServiceCard({ service }) {
  const {
    service_slug: serviceSlug,
    heading,
    subheading,
    hero_image_1_url: heroImagePrimary,
  } = service;

  return (
    <article className="service-card">
      {heroImagePrimary && (
        <img src={heroImagePrimary} alt={heading} className="service-card-image" />
      )}
      <div className="service-card-body">
        <h3>{heading}</h3>
        {subheading && <p>{subheading}</p>}
        <Link className="button button--ghost" to={`/services/${serviceSlug}`}>
          View service
        </Link>
      </div>
    </article>
  );
}
