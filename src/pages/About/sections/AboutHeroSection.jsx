import React from 'react';
import { Link } from 'react-router-dom';

const AboutHeroSection = () => (
  <header data-copilot="true" className="section max-height_100vh_desktop overflow_hidden flex_horizontal">
    <div className="container">
      <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
        <div className="rotate_-12deg tablet-straight">
          <div className="w-layout-grid grid_1-col gap-small">
            <div className="image-ratio_3x2">
              <img
                width=""
                height=""
                alt="Vet assisting an animal"
                src="https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/adfe4de3-4bd2-485f-9f46-d2394c32d69a.avif"
                loading="lazy"
                data-aisg-image-id="adfe4de3-4bd2-485f-9f46-d2394c32d69a"
                className="image_cover"
              />
            </div>
            <div className="image-ratio_3x2">
              <img
                width=""
                height=""
                alt="Volunteers helping animals"
                src="https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/1705e9bf-d4c9-4680-8ee2-9419f7174673.avif"
                loading="lazy"
                data-aisg-image-id="1705e9bf-d4c9-4680-8ee2-9419f7174673"
                className="image_cover"
              />
            </div>
          </div>
        </div>
        <div id="w-node-_857eff80-a064-80f6-efa6-2aa55402b17a-5402b172" className="header w-node-aca1decb-952a-6d03-8948-04348d12084d-0653ac4e">
          <h1 className="heading_h1">Care for every wagging tail</h1>
          <p className="subheading">
            Personalized dog training, walks, and loving care—tailored for every pup. From energetic walks to cozy boarding,
            your dog’s happiness and safety come first. Let’s make every day their best day.
          </p>
          <div className="button-group">
            <Link to="/contact" className="button w-button">
              Book now
            </Link>
            <Link to="/services" className="button is-secondary w-button">
              See services
            </Link>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default AboutHeroSection;