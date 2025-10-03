import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_HEADING = 'Care your dog deserves';
const DEFAULT_PRIMARY_CTA = { label: 'Book now', url: '/contact?service=consultation' };
const DEFAULT_SECONDARY_CTA = { label: 'Contact', url: '/contact' };

const isInternalLink = (url) => typeof url === 'string' && url.startsWith('/');

const CtaButton = ({ cta, variant }) => {
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

const ServicesCtaSection = ({ heading, primaryCta, secondaryCta }) => {
  const resolvedHeading = heading || DEFAULT_HEADING;
  const { resolvedPrimary, resolvedSecondary } = useMemo(
    () => ({
      resolvedPrimary: primaryCta?.label && primaryCta?.url ? primaryCta : DEFAULT_PRIMARY_CTA,
      resolvedSecondary: secondaryCta?.label && secondaryCta?.url ? secondaryCta : DEFAULT_SECONDARY_CTA,
    }),
    [primaryCta, secondaryCta],
  );

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-small">
          <h2 className="margin-bottom_none">{resolvedHeading}</h2>
          <div className="button-group margin-top_none">
            <CtaButton cta={resolvedPrimary} />
            <CtaButton cta={resolvedSecondary} variant="secondary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesCtaSection;