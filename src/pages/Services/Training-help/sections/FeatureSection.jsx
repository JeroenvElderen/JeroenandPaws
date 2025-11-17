import React from "react";
import { Link } from "react-router-dom";

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
            <h1 className="heading_h1">Expert Dog Care, Tailored For You</h1>
            <p className="subheading">
              From training to daily walks, boarding, and daycare—your dog’s
              happiness and well-being are my top priority. Let’s create a
              routine that fits your life and your pup’s needs.
            </p>
            <div className="button-group">
          <Link to="/booking/training-meet" className="button w-button">
            Book a Meet &amp; Greet
          </Link>
              <a href="#services" className="button is-secondary w-button">
                See Services &amp; Pricing
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
                    src="/images/2b4d97a3-883d-4557-abc5-8cf8f3f95400.avif"
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
                    src="/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif"
                    alt="animal adoption"
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
