import React from "react";
import Link from "next/link";
import Image from "next/image";

const HomeHeroSection = () => (
  <header className="section padding_none text-color_on-overlay is-inverse">
    <div className="w-layout-grid grid_1-col">
      <div id="w-node-_83130efd-cc89-3e63-e012-238651cb9c90-51cb9c8e" className="position_relative min-height_100dvh w-node-_74183d39-97ba-696d-d9e0-d3e4e5d79529-055fd1ce">
        <Image
          src="/images/d1c5edae-66f0-4727-a854-02ccbbab7dc4.avif"
          alt="Clinic reception area for a veterinary clinic"
          fill
          priority
          fetchPriority="high"
          loading="eager"
          sizes="100vw"
          className="image_cover position_absolute radius_all-0"
        />
        <div className="overlay_opacity-middle mask_top">
          Welcome to a place where your companion is understood, celebrated, and
          genuinely cared for. Every detail of our service is thoughtfully
          designed to create comfort, confidence, and joy for your four-legged
          family member.
        </div>
      </div>
      <div
        id="w-node-_83130efd-cc89-3e63-e012-238651cb9c93-51cb9c8e"
        className="container position_relative padding-bottom_large z-index_2 w-node-_74183d39-97ba-696d-d9e0-d3e4e5d79533-055fd1ce"
      >
        <div className="header is-2-col">
          <h1 className="heading_h1 margin-bottom_none text-color">
            Exceptional care for the companion you love
          </h1>
          <div
            id="w-node-b44b49b5-d3e6-a05f-997e-8ac7efbac3da-51cb9c8e"
            className="flex_vertical gap-xsmall w-node-_74183d39-97ba-696d-d9e0-d3e4e5d79531-055fd1ce"
          >
            <p className="paragraph_large text-color">
              From engaging walks and reassuring home check-ins to enriching
              daycare, boarding, and personalised training, we create
              experiences where your companion feels safe, stimulated, and truly
              at home. Trust us to provide attentive, heartfelt care—because
              here, every companion is family.
            </p>
            <div className="button-group">
              <Link href="/services" className="button on-inverse w-button">
                Discover more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default HomeHeroSection;
