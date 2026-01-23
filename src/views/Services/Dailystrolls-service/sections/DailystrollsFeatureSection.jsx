import React from "react";

const DailystrollsFeatureSection = ({ onBook }) => {
  return (
    <header className="section" data-sticky-anchor="true">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          {/* Left text column */}
          <div
            id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea12-edaeea0f"
            className="header w-node-f1b26e5a-b33b-e9ba-a521-149172f27d26-6cecf403"
          >
            <h1 className="heading_h1">Daily walks, happier companions</h1>
            <p className="subheading">
              Reliable, safe, and enriching walks — from quick neighbourhood
              outings to longer adventures. Ideal for busy owners who want their
              companions engaged, exercised, and genuinely cared for throughout
              the day.
            </p>
            <div className="button-group">
              <button
                type="button"
                className="button w-button"
                onClick={onBook}
              >
                Book your first walk
              </button>
              <a href="#services" className="button is-secondary w-button">
                View walk plans & pricing
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
                    alt="dog walking"
                    className="image image_cover"
                  />
                </div>
                {/* Bottom image */}
                <div
                  id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea21-edaeea0f"
                  className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d2a-6cecf403"
                >
                  <img
                    src="/images/dogs/lola/lola1.jpeg"
                    alt="happy dog on walk"
                    className="image image_cover shadow_xlarge"
                    style={{
                      objectFit: "cover",
                      objectPosition: "0% 45%",
                    }}
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

export default DailystrollsFeatureSection;
