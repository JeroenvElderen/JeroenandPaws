import React from 'react';

const StyleGuideNavigation = () => (
  <nav className="sg_navigation">
            <div className="sg_logo">
              <h1 className="heading_h4 margin-bottom_none">Style Guide</h1>
              <div className="text-color_secondary">Version 1.0</div>
            </div>
            <div className="sg_nav-menu">
              <div className="sg_nav-menu-group">
                <a href="#Foundation" className="sg_nav-menu-heading">
                  <h5 className="sg_nav-subheading">Foundations</h5>
                </a>
                <a href="#Foundation-Palette" className="sg_nav-menu-item">
                  <div>Color</div>
                </a>
                <a href="#Foundation-Typography" className="sg_nav-menu-item">
                  <div>Typography</div>
                </a>
                <a href="#Foundation-Spacing" className="sg_nav-menu-item">
                  <div>Spacing</div>
                </a>
              </div>
              <div className="sg_nav-menu-group">
                <a href="#Components" className="sg_nav-menu-heading">
                  <h5 className="sg_nav-subheading">Components</h5>
                </a>
                <a href="#Components-Button" className="sg_nav-menu-item">
                  <div>Buttons</div>
                </a>
                <a href="#Components-Tag" className="sg_nav-menu-item">
                  <div>Tag</div>
                </a>
                <a href="#Components-Image" className="sg_nav-menu-item">
                  <div>Images</div>
                </a>
                <a href="#Components-Icons" className="sg_nav-menu-item">
                  <div>Icons</div>
                </a>
                <a href="#Components-Forms" className="sg_nav-menu-item">
                  <div>Forms</div>
                </a>
                <a href="#Components-Cards" id="" className="sg_nav-menu-item">
                  <div>Cards</div>
                </a>
                <a href="#Components-Tabs" className="sg_nav-menu-item">
                  <div>Tabs</div>
                </a>
                <a href="#Components-Slider" className="sg_nav-menu-item">
                  <div>Slider</div>
                </a>
                <a href="#Components-Accordion" className="sg_nav-menu-item">
                  <div>Accordion</div>
                </a>
                <a href="#Components-Dropdown" className="sg_nav-menu-item">
                  <div>Dropdown</div>
                </a>
                <a href="#Components-Richtext" className="sg_nav-menu-item">
                  <div>Richtext</div>
                </a>
                <a href="#Components-Divider" className="sg_nav-menu-item">
                  <div>Divider</div>
                </a>
              </div>
            </div>
          </nav>
);

export default StyleGuideNavigation;