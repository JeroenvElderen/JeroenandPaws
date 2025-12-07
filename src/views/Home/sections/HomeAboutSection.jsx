import React from "react";
import Link from "next/link";
import Image from "next/image";

const HomeAboutSection = () => (
  <section data-copilot="true" className="section padding_none">
    <div className="w-layout-grid grid_4-col">
      <div id="w-node-_25aa69ea-f6ff-a983-3b30-a346b1836f6c-7ac2c669" className="image-ratio_3x2 radius_all-0 w-node-bd678469-22c4-f2df-4448-11fb241a1843-055fd1ce">
        <Image
          src="/images/d801bc7b-4e2e-4836-8ed2-f4f819ecc79a.avif"
          alt="Vet assisting an animal"
          fill
          sizes="(min-width: 1280px) 50vw, 100vw"
          className="image_cover"
        />
      </div>
      <div
        id="w-node-cbbfa81d-641d-6741-5de9-6b9e7ac2c66d-7ac2c669"
        className="container width_100percent_tablet w-node-bd678469-22c4-f2df-4448-11fb241a184f-055fd1ce"
      >
        <div className="w-layout-grid grid_2-col tablet-1-col margin-bottom_xxlarge position_relative">
          <div className="card">
            <div className="card_body">
              <h2>Personalised care for your beloved companion</h2>
              <div className="rich-text w-richtext">
                <p>
                  With over seven years of experience, I provide thoughtful
                  training, walking, and boarding services shaped around your
                  companion’s unique needs. Here, they enjoy a safe, warm, and
                  nurturing environment that feels just like home — because
                  their comfort truly matters.
                </p>
              </div>
              <div className="button-group">
                <Link href="/about" className="button w-button">
                  Discover more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HomeAboutSection;
