import React from 'react';
import { Link } from 'react-router-dom';

const DetailHeroSection = () => (
  <header data-record-id="3c61b1d7-5312-c3a9-ea24-95794965fc14" data-copilot="true" className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea12-edaeea0f" className="header w-node-f1b26e5a-b33b-e9ba-a521-149172f27d26-6cecf403">
            <h1 className="heading_h1">Expert Dog Care, Tailored For You</h1>
            <p className="subheading">From training to daily walks, boarding, and daycare—your dog’s happiness and well-being are my top priority. Let’s create a routine that fits your life and your pup’s needs.</p>
            <div className="button-group">
              <Link to="/contact?service=meet-and-greet" className="button w-button">Book a Meet &amp; Greet</Link>
              <Link to="/services#walk-and-train" className="button is-secondary w-button">See Services &amp; Pricing</Link>
            </div>
          </div>
          <div className="position_relative flex_horizontal">
            <div className="custom_hero-right-offset">
              <div className="grid_9-col position_relative z-index_2">
                <div id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea1f-edaeea0f" className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d28-6cecf403"><img width="1216" height="832" alt="Animal training session for a welfare nonprofit" src="/images/2b4d97a3-883d-4557-abc5-8cf8f3f95400.avif" loading="lazy" data-aisg-image-id="c56ebe89-25cf-4b6d-8068-7636c86bdcdf" className="image image_cover" /></div>
                <div id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea21-edaeea0f" className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d2a-6cecf403"><img width="1216" height="832" alt="Animal adoption event" src="/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif" loading="lazy" data-aisg-image-id="5b67c60d-5ded-45db-861a-7a2ca8ccea63" className="image image_cover shadow_xlarge" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
);

export default DetailHeroSection;