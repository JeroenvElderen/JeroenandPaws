import React from "react";
import Image from "next/image";
import Link from "next/link";

const HomeCtaSection = () => (
  <section data-copilot="true" className="section padding_none">
    <div className="w-layout-grid grid_1-col">
      <div id="w-node-_05e54f8c-7d0c-01e1-5321-d818b7d69662-5ebb016a" className="position_relative w-node-_851fc987-fbf0-69dc-8fc4-d770671b8b0d-055fd1ce">
          <Image
            src="/images/490c688c-e948-444d-8655-990a7271d634.avif"
            alt="Editing software displayed on a studio screen"
            fill
            sizes="100vw"
            className="image_cover position_absolute"
          />
        </div>
      <div
        id="w-node-_05e54f8c-7d0c-01e1-5321-d818b7d69664-5ebb016a"
        className="container position_relative padding_section events_none w-node-_851fc987-fbf0-69dc-8fc4-d770671b8b2e-055fd1ce"
      >
        <div className="card">
          <div className="card_body events_auto">
            <div className="w-layout-grid grid_3-col tablet-1-col gap-medium">
              <div
                id="w-node-_86672d52-e14b-c232-ad3a-e062de5187ae-5ebb016a"
                className="header margin-bottom_none w-node-_851fc987-fbf0-69dc-8fc4-d770671b8b28-055fd1ce"
              >
                <h2 className="heading_h2">
                  Caring for your companion like family
                </h2>
                <div className="flex_vertical gap-xsmall">
                  <div className="flex_horizontal gap-xxsmall">
                    <div className="icon is-small">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <p className="paragraph_small margin-bottom_none">
                      Personalised training shaped around your companion’s
                      unique needs
                    </p>
                  </div>
                  <div className="divider"></div>
                  <div className="flex_horizontal gap-xxsmall">
                    <div className="icon is-small">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <p className="paragraph_small margin-bottom_none">
                      Dependable daily walks designed for every pace and
                      personality
                    </p>
                  </div>
                  <div className="divider"></div>
                  <div className="flex_horizontal gap-xxsmall">
                    <div className="icon is-small">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <p className="paragraph_small margin-bottom_none">
                      Safe, enjoyable boarding and enriching daytime care
                    </p>
                  </div>
                </div>
                <div className="button-group">
                  <Link href="/contact" className="button w-button">
                    Begin your journey
                  </Link>
                </div>
              </div>
              <div className="image-ratio_auto">
                  <Image
                    src="/images/6112f29d-dcad-4748-87cd-799ae8f92763.avif"
                    alt="Distillery community involvement"
                    width={352}
                    height={289}
                    sizes="(min-width: 1024px) 352px, 80vw"
                    className="image_cover"
                  />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HomeCtaSection;
