export function HeroSection({ hero }) {
  if (!hero) {
    return null;
  }

  const {
    heading,
    subheading,
    primary_cta_label: primaryCtaLabel,
    primary_cta_url: primaryCtaUrl,
    secondary_cta_label: secondaryCtaLabel,
    secondary_cta_url: secondaryCtaUrl,
    hero_image_1_url: heroImagePrimary,
    hero_image_2_url: heroImageSecondary,
  } = hero;

  return (
    <section className="hero" id="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>{heading}</h1>
          {subheading && <p className="hero-subheading">{subheading}</p>}
          <div className="hero-actions">
            {primaryCtaLabel && primaryCtaUrl && (
              <a className="button button--primary" href={primaryCtaUrl}>
                {primaryCtaLabel}
              </a>
            )}
            {secondaryCtaLabel && secondaryCtaUrl && (
              <a className="button button--ghost" href={secondaryCtaUrl}>
                {secondaryCtaLabel}
              </a>
            )}
          </div>
        </div>
        <div className="hero-media">
          {heroImagePrimary && (
            <img src={heroImagePrimary} alt="Happy pet" className="hero-image primary" />
          )}
          {heroImageSecondary && (
            <img src={heroImageSecondary} alt="Jeroen and a pet" className="hero-image secondary" />
          )}
        </div>
      </div>
    </section>
  );
}
