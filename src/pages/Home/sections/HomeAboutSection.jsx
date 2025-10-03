import React from 'react';
import { Link } from 'react-router-dom';

const HomeAboutSection = () => (
  <section data-copilot="true" className="section padding_none">
      <div className="w-layout-grid grid_4-col">
        <div id="w-node-_25aa69ea-f6ff-a983-3b30-a346b1836f6c-7ac2c669" className="image-ratio_3x2 radius_all-0 w-node-bd678469-22c4-f2df-4448-11fb241a1843-055fd1ce"><img width="1193" height="795" alt="Vet assisting an animal" src="/images/d801bc7b-4e2e-4836-8ed2-f4f819ecc79a.avif" loading="lazy" data-aisg-image-id="adfe4de3-4bd2-485f-9f46-d2394c32d69a" className="image_cover" /></div>
        <div id="w-node-cbbfa81d-641d-6741-5de9-6b9e7ac2c66d-7ac2c669" className="container width_100percent_tablet w-node-bd678469-22c4-f2df-4448-11fb241a184f-055fd1ce">
          <div className="w-layout-grid grid_2-col tablet-1-col margin-bottom_xxlarge position_relative">
            <div className="card">
              <div className="card_body">
                <h2>Tailored care for your furry friend</h2>
                <div className="rich-text w-richtext">
                  <p>With over 7 years of experience, I offer personalized training, walking, and boarding services for dogs of all breeds. Your pet will enjoy a safe, fun, and loving environment, just like home.</p>
                </div>
                <div className="button-group">
                  <Link to="/about" className="button w-button">Discover more</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
);

export default HomeAboutSection;