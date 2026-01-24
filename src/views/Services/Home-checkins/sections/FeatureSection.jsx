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
              Home Check-Ins — Steady Support and Comfort at Home
            </h1>
            <p className="subheading">
              If you cannot be there, I will visit your companion at home to
              ensure they remain safe, comfortable, and settled. Each check-in
              can include feeding, fresh water, outdoor breaks, gentle
              interaction, and calm companionship. After every visit, you will
              receive a brief update and photographs, giving you peace of mind
              while you are away.
            </p>
            <div className="button-group">
              <button type="button" onClick={onBook} className="button w-button">

                Book a home check-in
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
                    alt="companion at home"
                    className="image image_cover"
                    loading="lazy"
                  />
                </div>
                {/* Bottom image */}
                <div
                  id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea21-edaeea0f"
                  className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d2a-6cecf403"
                >
                  <img
                    src="/images/dogs/Nola/nola2.jpg"
                    alt="companion lying indoors"
                    className="image image_cover shadow_xlarge"
                    style={{ objectPosition: "50% 35%" }}
                    loading="lazy"
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
