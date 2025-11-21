import React from 'react';
import Link from 'next/link';

const HomeHeroSection = () => (
  <header className="section padding_none text-color_on-overlay is-inverse">
    <div className="w-layout-grid grid_1-col">
      <div id="w-node-_83130efd-cc89-3e63-e012-238651cb9c90-51cb9c8e" className="position_relative min-height_100dvh w-node-_74183d39-97ba-696d-d9e0-d3e4e5d79529-055fd1ce"><img width="1596" height="870" alt="Clinic reception area for a veterinary clinic" src="/images/d1c5edae-66f0-4727-a854-02ccbbab7dc4.avif" loading="lazy" data-aisg-image-id="a1bf0ca8-09f4-44de-9832-4e64dd4c87ad" className="image_cover position_absolute radius_all-0" />
        <div className="overlay_opacity-middle mask_top">Step into a world where your dog&#x27;s joy and well-being are our mission. Our tailored services ensure every pet feels cherished and secure.</div>
      </div>
      <div id="w-node-_83130efd-cc89-3e63-e012-238651cb9c93-51cb9c8e" className="container position_relative padding-bottom_large z-index_2 w-node-_74183d39-97ba-696d-d9e0-d3e4e5d79533-055fd1ce">
        <div className="header is-2-col">
          <h1 className="heading_h1 margin-bottom_none text-color">Caring for your pet with expertise and love</h1>
          <div id="w-node-b44b49b5-d3e6-a05f-997e-8ac7efbac3da-51cb9c8e" className="flex_vertical gap-xsmall w-node-_74183d39-97ba-696d-d9e0-d3e4e5d79531-055fd1ce">
            <p className="paragraph_large text-color">Whether it&#x27;s personalized training or a fun-filled daycare, we nurture an environment where your dog thrives. Count on us for the affection and care your pet deserves.</p>
            <div className="button-group">
              <Link href="/services" className="button on-inverse w-button">Discover more</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default HomeHeroSection;