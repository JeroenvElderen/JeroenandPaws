import React from 'react';
import { Link } from 'react-router-dom';

const ServicesCtaSection = () => (
  <section className="section is-secondary">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-small">
          <h2 className="margin-bottom_none">Care your dog deserves</h2>
          <div id="w-node-a0716485-74b7-5610-0f39-21a551ba8ab3-51ba8aae" className="button-group margin-top_none w-node-_8f7bd1a1-5c28-01fc-fedd-74dceca3d3cb-df7276e1">
            <Link to="/contact?service=consultation" className="button w-button">Book now</Link>
            <Link to="/contact" className="button is-secondary w-button">Contact</Link>
          </div>
        </div>
      </div>
    </section>
);

export default ServicesCtaSection;