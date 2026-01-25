import React from 'react';
import StyleGuideComponentsSection from './sections/StyleGuideComponentsSection';
import StyleGuideFoundationSection from './sections/StyleGuideFoundationSection';

const StyleGuideMainContent = () => (
  <main id="main" className="sg_page-content">
    <StyleGuideFoundationSection />
    <StyleGuideComponentsSection />
  </main>
);

export default StyleGuideMainContent;
