import React from 'react';
import Image from 'next/image';

const HomeTestimonialsSection = () => (
  <section data-copilot="true" className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div id="w-node-_0dc7589f-614c-e2cf-7555-5eed0be05d1f-0be05d1c" className="flex_horizontal flex_vertical is-space-between w-node-f5984468-b07a-271c-06a7-f4645ab0ffb7-055fd1ce">
            <div className="header">
              <h2>What our clients say</h2>
              <p className="subheading">Discover how our personalized dog care services have made a difference for pet owners like you. From training to boarding, our clients share their experiences.</p>
            </div>
            <div className="w-layout-grid grid_2-col gap-small">
              <div>
                <div className="heading_h1">100+</div>
                <div>Satisfied pet owners</div>
              </div>
              <div>
                <div className="heading_h1">5k+</div>
                <div>Walks and visits</div>
              </div>
            </div>
          </div>
          <div className="w-layout-grid grid_2-col mobile-l-1-col gap-small">
            <div id="w-node-d6288141-3e37-a760-1f1f-3f87c261e1bc-0be05d1c" className="card w-node-f5984468-b07a-271c-06a7-f4645ab0ffc6-055fd1ce">
              <div className="card_body_small">
                <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                  <div className="avatar">
                  <Image
                    width={64}
                    height={64}
                    alt="Headshot of a customer interacting with their pet"
                    src="/images/dogs/lola/lola1.jpeg"
                    className="image_cover"
                  />
                </div>
                  <div>
                    <div className="paragraph_small margin-bottom_none"><strong>Sophie</strong></div>
                    <div className="paragraph_small">pet owner</div>
                  </div>
                </div>
                <p className="paragraph_small margin-bottom_none">Jeroen is absolutely amazing with our dogs. He takes them every week day to their favourite place for a half hour walk and provides lots of photos. The dogs love him and are always visibly excited coming up to the time he arrives to take them for their walk.</p>
              </div>
            </div>
            <div className="card">
              <div className="card_body_small">
                <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                  <div className="avatar">
                  <Image
                    width={64}
                    height={64}
                    alt="Headshot of a happy pet owner after training"
                    src="/images/Bonnie.jpeg"
                    className="image_cover"
                  />
                </div>
                  <div>
                    <div className="paragraph_small margin-bottom_none"><strong>Michelle</strong></div>
                    <div className="paragraph_small">Pet parent</div>
                  </div>
                </div>
                <p className="paragraph_small margin-bottom_none">Felt so at ease leaving our dog Bonnie at home for 2 days with Jeroen looking after her. From the initial communication i found Jeroen to be so thoughtful and considerate. Would happily use Jeroen again and can highly recommend.</p>
              </div>
            </div>
            <div id="w-node-_57b0b48d-fc7d-2a70-7d13-21713b2c2f03-0be05d1c" className="card w-node-f5984468-b07a-271c-06a7-f4645ab0ffe4-055fd1ce">
              <div className="card_body_small">
                <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                  <div className="avatar">
                  <Image
                    width={64}
                    height={64}
                    alt="Headshot of a customer with their pet"
                    src="/images/dogs/kaiser/kaiser1.jpeg"
                    className="image_cover"
                  />
                </div>
                  <div>
                    <div className="paragraph_small margin-bottom_none"><strong>Katherine</strong></div>
                    <div className="paragraph_small">Pet owner</div>
                  </div>
                </div>
                <p className="paragraph_small margin-bottom_none">Excellent service. I feel so at ease now i know Kaiser is being kept company and let out for wees and poos while i'm at work. Jeroen is so communicative every visit he sends me pictures that brighten up my day.</p>
              </div>
            </div>
            <div className="card">
              <div className="card_body_small">
                <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                  <div className="avatar">
                  <Image
                    width={64}
                    height={64}
                    alt="Headshot of a customer"
                    src="/images/dogs/Nola/nola2.jpg"
                    className="image_cover"
                  />
                </div>
                  <div>
                    <div className="paragraph_small margin-bottom_none"><strong>Tom</strong></div>
                    <div className="paragraph_small">Dog owner</div>
                  </div>
                </div>
                <p className="paragraph_small margin-bottom_none">Jeroen has been fantastic walking and looking after our 10 month old Corgi. He sends lots of great photos, takes her on fun walks and plays & relaxes with her depending on her mood.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
);

export default HomeTestimonialsSection;