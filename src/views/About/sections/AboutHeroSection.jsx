import React from "react";
import Link from "next/link";
import Image from "next/image";

const AboutHeroSection = () => (
  <header data-copilot="true" className="section flex_horizontal">
    <div className="container">
      <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
        <div className="rotate_-12deg tablet-straight">
          <div className="w-layout-grid grid_1-col gap-small">
            <div className="image-ratio_3x2">
              <Image
                src="/images/Jeroen.jpg"
                alt="Jeroen's profile"
                width={800}
                height={533}
                className="image_cover"
                priority
              />
            </div>
            <div className="image-ratio_3x2">
              <Image 
                src="/images/IMG_4278.jpg"
                alt="Compass - Alaskan Husky"
                width={800}
                height={533}
                className="image_cover"
                priority
              />
            </div>
          </div>
        </div>
        <div
          id="w-node-_857eff80-a064-80f6-efa6-2aa55402b17a-5402b172"
          className="header w-node-aca1decb-952a-6d03-8948-04348d12084d-0653ac4e"
        >
          <h1 className="heading_h1">About me</h1>
          <p className="subheading">
            As a certified canine specialist with over 7 years of experience working with companion and working dogs, I deliver tailored training, thoughtful care, and a secure, enriching environment for every dog I welcome. From customized walks to structured day care and boarding, your dog receives the same dedication and consistency I give my own.

I prioritize safety, clear communication, and emotional well-being—keeping you updated and your dog happy, relaxed, and fulfilled. Exceptional care starts here.
          </p>
          <div className="button-group">
            <Link href="/contact" className="button w-button">
              Book now
            </Link>
            <Link href="/services" className="button is-secondary w-button">
              See services
            </Link>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default AboutHeroSection;
