import React from 'react';
import FoundationHero from './foundation/FoundationHero';
import FoundationPalette from './foundation/FoundationPalette';
import FoundationSpacing from './foundation/FoundationSpacing';
import FoundationTypography from './foundation/FoundationTypography';

const StyleGuideFoundationSection = () => (
  <div id="Foundation">
    <FoundationHero />
    <section className="section background_secondary">
      <FoundationPalette />
    </section>
    <FoundationTypography />
    <FoundationSpacing />
  </div>
);

export default StyleGuideFoundationSection;
