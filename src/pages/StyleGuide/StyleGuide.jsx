import React from 'react';
import StyleGuideCodeEmbed from './components/StyleGuideCodeEmbed';
import StyleGuideNavigation from './components/StyleGuideNavigation';
import StyleGuideMainContent from './components/StyleGuideMainContent';

const StyleGuide = () => (
  <div data-scroll-time="0" className="sg_wrapper">
    <div>
      <StyleGuideCodeEmbed />
      <div data-scroll-time="0" className="sg_main-wrapper">
        <StyleGuideNavigation />
        <StyleGuideMainContent />
      </div>
    </div>
  </div>
);

export default StyleGuide;