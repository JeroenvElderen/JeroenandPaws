import React from "react";

const FeatureSection = ({ onBook }) => {
  return (
    <header className="section" data-sticky-anchor="true">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          {/* Left text column */}
          <div
            id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea12-edaeea0f"
            className="header w-node-f1b26e5a-b33b-e9ba-a521-149172f27d26-6cecf403"
          >
            <h1 className="heading_h1">Bespoke dog care, designed around your life</h1>
            <p className="subheading">
              From training to daily walks, day care, and boarding — your dog’s comfort and happiness always come first. Together, we’ll create a personalised care plan that suits your lifestyle and supports your dog’s unique needs.
            </p>
              <div className="button-group">
              <button type="button" onClick={onBook} className="button w-button">
                Book a Meet &amp; Greet
              </button>
              <a href="#services" className="button is-secondary w-button">
                View services & pricing
              </a>
            </div>
          </div>

          {/* Right images column */}
          <div className="position_relative flex_horizontal">
            <div className="custom_hero-right-offset">
              <div className="grid_9-col position_relative z-index_2">
                {/* Top image */}
                <div
                  id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea1f-edaeea0f"
                  className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d28-6cecf403"
                >
                  <img
                    src="/images/background/bg2.jpg"
                    alt="dog training"
                    className="image image_cover"
                  />
                </div>
                {/* Bottom image */}
                <div
                  id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea21-edaeea0f"
                  className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d2a-6cecf403"
                >
                  <img
                    src="/images/dogs/ollie/ollie1.jpeg"
                    alt="animal adoption"
                    className="image image_cover shadow_xlarge"
                    style={{ objectPosition: "50% 60%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FeatureSection;
