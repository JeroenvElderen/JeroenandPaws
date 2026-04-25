export const getServiceCtaLabel = (service, defaultCta = "Send request") => {
  if (!service) return defaultCta;
  if (service.ctaText) return service.ctaText;
  if (service.duration) return `Request ${service.duration}`;
  if (service.title) return `Request ${service.title}`;
  return defaultCta;
};