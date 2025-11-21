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
};

export const getServiceLabel = (serviceId = '') =>
  SERVICE_LABELS[serviceId] || 'Custom booking request';