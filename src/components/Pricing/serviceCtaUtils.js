export const getServiceCtaLabel = (service, defaultCta = "Check availability") => {
  if (!service) return defaultCta;
  if (service.ctaText) return service.ctaText;
  if (service.duration) return `Book ${service.duration}`;
  if (service.title) return `Book ${service.title}`;
  return defaultCta;
};