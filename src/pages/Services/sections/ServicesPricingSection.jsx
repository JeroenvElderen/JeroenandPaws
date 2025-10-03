import React from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_PLANS = [
  {
    id: 'walk-and-train',
    service_slug: 'walk-and-train',
    title: 'Walk & Train',
    price: '$0',
    footnote: 'Always free',
    description:
      'Perfect for daily walks and basic training. Flexible, friendly, and tailored to your dog’s needs.\n30-min or custom walks\nGentle, positive training\nPhoto & update after each visit',
    button_label: 'Book now',
    button_url: '/contact?service=walk-and-train',
  },
  {
    id: 'day-care',
    service_slug: 'day-care',
    title: 'Day Care',
    price: '$9',
    footnote: 'Per walk',
    description:
      'A safe, playful space for your dog while you’re busy. Half or full days, always supervised and fun.\nSocial play & enrichment\nFlexible drop-off & pick-up\nPersonalized care routines\nDaily photo updates',
    button_label: 'Reserve',
    button_url: '/contact?service=day-care',
  },
  {
    id: 'boarding',
    service_slug: 'boarding',
    title: 'Boarding',
    price: '$49',
    footnote: 'Per night',
    description:
      'Overnight stays in a loving home. Your dog enjoys comfort, structure, and plenty of attention.\n24/7 supervision\nDaily walks & playtime\nMedication if needed\nUpdates & photos\nCustom care requests',
    button_label: 'Request',
    button_url: '/contact?service=boarding',
  },
];

const isInternalLink = (url) => typeof url === 'string' && url.startsWith('/');

const PlanButton = ({ label, url }) => {
  if (!label || !url) {
    return null;
  }

  return isInternalLink(url) ? (
    <Link to={url} className="button w-inline-block">
      <div>{label}</div>
    </Link>
  ) : (
    <a href={url} className="button w-inline-block" target="_blank" rel="noreferrer">
      <div>{label}</div>
    </a>
  );
};

const ServicesPricingSection = ({ carePlans = [] }) => {
  const plans = carePlans.length > 0 ? carePlans : FALLBACK_PLANS;

  const normalisedPlans = plans.map((plan) => {
    const descriptionLines = (plan.description || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      id: plan.id || plan.service_slug || plan.title,
      slug: plan.service_slug || '',
      title: plan.title || 'Care plan',
      price: plan.price || '',
      footnote: plan.footnote || '',
      summary: descriptionLines[0] || '',
      features: descriptionLines.slice(1),
      buttonLabel: plan.button_label,
      buttonUrl: plan.button_url,
    };
  });

  if (normalisedPlans.length === 0) {
    return null;
  }

  return (
    <section className="section is-secondary">
      <div className="container">
        <ul className="grid_3-col gap-small padding_none margin-bottom_none w-list-unstyled">
          {normalisedPlans.map((plan) => (
            <li key={plan.id} id={plan.slug || undefined}>
              <div className="card on-secondary">
                <div className="card_body">
                  <div className="margin-bottom_xsmall">
                    <div className="w-layout-hflex">
                      {plan.price && <h4 className="heading_h2 margin-bottom_none">{plan.price}</h4>}
                    </div>
                    {plan.footnote && <p className="paragraph_small">{plan.footnote}</p>}
                  </div>
                  <div className="divider is-secondary"></div>
                  <div className="margin-top_xsmall margin_bottom-auto">
                    <h5 className="heading_h3">{plan.title}</h5>
                    {plan.summary && <p>{plan.summary}</p>}
                  </div>
                  <div className="button-group margin-top_xsmall">
                    <PlanButton label={plan.buttonLabel} url={plan.buttonUrl} />
                  </div>
                </div>
              </div>
              {plan.features.length > 0 && (
                <ul aria-label="Plan features" className="margin-bottom_none margin-top_small w-list-unstyled">
                  <li className="flex_horizontal gap-xxsmall">
                    <p className="eyebrow">Includes:</p>
                  </li>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={`${plan.id}-feature-${featureIndex}`} className="flex_horizontal gap-xxsmall">
                      <div className="icon is-xsmall is-background">
                        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor" />
                        </svg>
                      </div>
                      <p>{feature}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ServicesPricingSection;