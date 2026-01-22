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
            <h1 className="heading_h1">
              Solo Journeys — Focused Adventures at Their Pace
            </h1>
            <p className="subheading">
              Designed for companions who thrive with undivided attention and
              space to explore at their own rhythm. Whether it’s a steady walk,
              a longer outing, or time to pause and take in the world, each
              journey is shaped around their comfort, confidence, and curiosity.
              After every outing, you receive a brief update and photographs so
              you can share in their experience.
            </p>
            <div className="button-group">
              <button
                type="button"
                onClick={onBook}
                className="button w-button"
              >
                Book a solo journey
              </button>
              <a href="#services" className="button is-secondary w-button">
                View services and pricing
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
                    src="/images/background/bg2.jpg"
                    alt="companion walking outdoors alone"
                    className="image image_cover"
                  />
                </div>
                {/* Bottom image */}
                <div
                  id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea21-edaeea0f"
                  className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d2a-6cecf403"
                >
                  <img
                    src="/images/dogs/lakta/lakta1.jpg"
                    alt="companion on individual outdoor walk"
                    className="image image_cover shadow_xlarge"
                    style={{ objectPosition: "0 35%" }}
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
