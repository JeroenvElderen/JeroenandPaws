import React from "react";
import Link from "next/link";

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
            <h1 className="heading_h1">Daytime care with heart for your companion</h1>
            <p className="subheading">
              While you’re away, your companion enjoys a safe, attentive, and nurturing space. With play, gentle stimulation, cozy naps, and calm supervision, they’re cared for as if they were part of the family — so you can focus on your day knowing they’re truly at ease.
            </p>
            <div className="button-group">
          <Link href="/booking/daytime-care-4h" className="button w-button">
            Book a daytime care spot
          </Link>
              <a href="#services" className="button is-secondary w-button">
                View daytime care plans & pricing
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
