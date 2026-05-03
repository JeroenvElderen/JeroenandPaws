import React from 'react';
import Services from '../../src/views/Services/Services';
import SeoMeta from '../../src/components/SeoMeta';
import StructuredData from '../../src/components/StructuredData';

const serviceUrls = [
  '/services/daily-strolls',
  '/services/home-check-ins',
  '/services/daytime-care',
  '/services/overnight-stays',
  '/services/group-adventures',
  '/services/solo-journeys',
  '/services/training-help',
  '/services/custom-solutions',
];

const ServicesPage = () => (
  <>
    <SeoMeta
      title="Services"
      description="Explore all dog care services including walks, care visits, and overnight support."
    />
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Dog Care Services',
        itemListElement: serviceUrls.map((url, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `https://jeroenandpaws.com${url}`,
        })),
      }}
    />
    <Services />
  </>
);

export default ServicesPage;
