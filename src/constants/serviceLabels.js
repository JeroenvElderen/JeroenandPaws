export const SERVICE_LABELS = {
  'daily-stroll-custom': 'Custom daily stroll',
  'daytime-care-custom': 'Custom daytime care',
  'home-check-in-custom': 'Custom home check-in',
  'group-adventures-custom': 'Custom group adventure',
  'custom-walk': 'Custom walk',
  'overnight-stay-custom': 'Custom overnight care',
  'custom-meet-greet': 'Custom meet and greet',
  'solo-journey-custom': 'Custom solo journey',
  'training-help-custom': 'Custom training help',

  // Service slugs used in request links.
  'daily-strolls': 'Daily strolls',
  'daytime-care': 'Daytime care',
  'home-check-ins': 'Home check-ins',
  'group-adventures': 'Group adventures',
  'solo-journeys': 'Solo journeys',
  'overnight-stays': 'Overnight stays',
  'training-help': 'Training help',
  'custom-solutions': 'Custom solutions',
  'meet-and-greet': 'Meet & greet',
};

const toTitleFromSlug = (serviceId = '') =>
  serviceId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getServiceLabel = (serviceId = '') => {
  if (!serviceId) return 'Custom booking request';
  return SERVICE_LABELS[serviceId] || toTitleFromSlug(serviceId) || 'Custom booking request';
};