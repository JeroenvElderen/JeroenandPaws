import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_IMAGE =
  'https://cdn.prod.website-files.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg';

const FALLBACK_ENTRIES = [
  {
    id: 'default-service',
    service_slug: 'walk-and-train',
    heading: 'This is a normal length heading.',
    subheading:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    primary_cta_label: 'Button text',
    primary_cta_url: '/services?service=walk-and-train#walk-and-train',
    secondary_cta_label: null,
    secondary_cta_url: null,
    hero_image_1_url: FALLBACK_IMAGE,
    hero_image_2_url: FALLBACK_IMAGE,
  },
];

const toTitleCase = (value) =>
  value
    ? value
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : 'Service';

const isInternalLink = (url) => typeof url === 'string' && url.startsWith('/');

const CtaLink = ({ cta, variant }) => {
  if (!cta?.label || !cta?.url) {
    return null;
  }

  const className = variant === 'secondary' ? 'button is-secondary w-button' : 'button w-button';

  return isInternalLink(cta.url) ? (
    <Link to={cta.url} className={className}>
      {cta.label}
    </Link>
  ) : (
    <a href={cta.url} className={className} target="_blank" rel="noreferrer">
      {cta.label}
    </a>
  );
};

const normaliseSlug = (value) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim().toLowerCase() : '';

const ServicesFeatureSection = ({ heroEntries = [], activeServiceSlug }) => {
  const entries = useMemo(
    () => (heroEntries.length > 0 ? heroEntries : FALLBACK_ENTRIES),
    [heroEntries],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (entries.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeServiceSlug) {
      const targetIndex = entries.findIndex(
        (entry) => normaliseSlug(entry.service_slug) === normaliseSlug(activeServiceSlug),
      );

      if (targetIndex !== -1) {
        setActiveIndex(targetIndex);
        return;
      }
    }

    setActiveIndex(0);
  }, [activeServiceSlug, entries]);

  const activeEntry = useMemo(
    () => entries[Math.min(activeIndex, entries.length - 1)] ?? entries[0],
    [entries, activeIndex],
  );

  const images = useMemo(() => {
    const sourceImages = [activeEntry?.hero_image_1_url, activeEntry?.hero_image_2_url].filter(Boolean);
    return sourceImages.length > 0 ? sourceImages : [FALLBACK_IMAGE];
  }, [activeEntry]);

  if (!activeEntry) {
    return null;
  }

  return (
    <section className="section">
      <div>
        <div className="container">
          <div className="header is-align-center heading-responsive_wrapper">
            <div className="eyebrow">{toTitleCase(activeEntry.service_slug)}</div>
            <h2 className="heading_h2">{activeEntry.heading || 'Explore our services'}</h2>
            {activeEntry.subheading && <p className="subheading">{activeEntry.subheading}</p>}
          </div>
        </div>
        <div className="flex_horizontal flex_vertical gap-large">
          <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
            <div className="flex_vertical gap-small">
              {images.map((imageUrl, index) => (
                <div key={`${activeEntry.id || activeEntry.service_slug}-image-${index}`} className="height_100dvh">
                  <img
                    src={imageUrl || FALLBACK_IMAGE}
                    alt={activeEntry.heading || 'Service visual'}
                    loading="lazy"
                    className="image image_cover radius_all-0"
                  />
                </div>
              ))}
            </div>
            <div className="position_sticky tablet-stick-bottom z-index_2 backdrop-filter_blur">
              <div className="flex_vertical gap-xsmall card_body max-width_large">
                {entries.map((entry, index) => {
                  const isActive = index === activeIndex;
                  const entryHeading = entry.heading || toTitleCase(entry.service_slug);
                  const entryDescription =
                    entry.subheading ||
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.';

                  return (
                    <React.Fragment key={entry.id || entry.service_slug || `hero-entry-${index}`}>
                      <div id={entry.service_slug || undefined}>
                        <button
                          type="button"
                          className={`custom_change-height-link w-inline-block${isActive ? ' w--current' : ''}`}
                          onClick={() => setActiveIndex(index)}
                          aria-pressed={isActive}
                          aria-current={isActive ? 'true' : undefined}
                        ></button>
                        <div className="eyebrow">{toTitleCase(entry.service_slug)}</div>
                        <h4>{entryHeading}</h4>
                        <div className="custom_change-height" style={{ maxHeight: isActive ? '30rem' : 0 }}>
                          <div className="padding-bottom_xsmall">
                            <p className="paragraph_large">{entryDescription}</p>
                            <div className="button-group">
                              <CtaLink
                                cta={{ label: entry.primary_cta_label, url: entry.primary_cta_url }}
                              />
                              <CtaLink
                                cta={{ label: entry.secondary_cta_label, url: entry.secondary_cta_url }}
                                variant="secondary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < entries.length - 1 && <div className="divider is-secondary"></div>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesFeatureSection;