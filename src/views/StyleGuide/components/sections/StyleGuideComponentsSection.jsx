import React from 'react';
import ComponentsAccordion from './components/ComponentsAccordion';
import ComponentsButtons from './components/ComponentsButtons';
import ComponentsCards from './components/ComponentsCards';
import ComponentsDivider from './components/ComponentsDivider';
import ComponentsDropdown from './components/ComponentsDropdown';
import ComponentsForms from './components/ComponentsForms';
import ComponentsHero from './components/ComponentsHero';
import ComponentsIcons from './components/ComponentsIcons';
import ComponentsImage from './components/ComponentsImage';
import ComponentsRichtext from './components/ComponentsRichtext';
import ComponentsSlider from './components/ComponentsSlider';
import ComponentsTabs from './components/ComponentsTabs';
import ComponentsTag from './components/ComponentsTag';

const StyleGuideComponentsSection = () => (
  <div id="Components">
    <ComponentsHero />
    <ComponentsButtons />
    <ComponentsTag />
    <ComponentsImage />
    <ComponentsIcons />
    <ComponentsForms />
    <ComponentsCards />
    <ComponentsTabs />
    <ComponentsSlider />
    <ComponentsAccordion />
    <ComponentsDropdown />
    <ComponentsRichtext />
    <ComponentsDivider />
  </div>
);

export default StyleGuideComponentsSection;
