import React from "react";

const FeatureSection = () => {
  return (
    <header className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          {/* Left text column */}
          <div
            id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea12-edaeea0f"
            className="header w-node-f1b26e5a-b33b-e9ba-a521-149172f27d26-6cecf403"
          >
            <h1 className="heading_h1">Boarding — A Loving Home While You’re Away</h1>
            <p className="subheading">
              When you’re traveling or away overnight, your dog will stay safe and happy in my home — with plenty of love, walks, play, and cozy spots to rest. Alongside my two friendly pups, they’ll have gentle company and a calm, family-like environment where they’re never just another guest.
            </p>
            <div className="button-group">
              <a href="#book" className="button w-button">
                Book Boarding Stay
              </a>
              <a href="#services" className="button is-secondary w-button">
                See Services &amp; Pricing
              </a>
            </div>
          </div>

          {/* Right images column — unchanged */}
          <div className="position_relative flex_horizontal">
            <div className="custom_hero-right-offset">
              <div className="grid_9-col position_relative z-index_2">
                {/* Top image */}
                <div
                  id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea1f-edaeea0f"
                  className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d28-6cecf403"
                >
                  <img
                    src="/images/2b4d97a3-883d-4557-abc5-8cf8f3f95400.avif"
                    alt="dog boarding comfortable home"
                    className="image image_cover"
                  />
                </div>
                {/* Bottom image */}
                <div
                  id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea21-edaeea0f"
                  className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d2a-6cecf403"
                >
                  <img
                    src="/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif"
                    alt="happy dog boarding stay"
                    className="image image_cover shadow_xlarge"
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
