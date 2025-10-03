import React from 'react';
import ServicesFeatureSection from './sections/ServicesFeatureSection';
import ServicesPricingSection from './sections/ServicesPricingSection';
import ServicesTestimonialsSection from './sections/ServicesTestimonialsSection';
import ServicesCtaSection from './sections/ServicesCtaSection';

const Services = () => (
  <main>
    <ServicesFeatureSection />
    <ServicesPricingSection />
    <ServicesTestimonialsSection />
    <ServicesCtaSection />
  </main>
);

export default Services;