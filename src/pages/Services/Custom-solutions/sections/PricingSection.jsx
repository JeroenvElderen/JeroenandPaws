import React from "react";

const PricingSection = () => {
  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Care Plans for Every Pup</h1>
        </div>
        <ul className="grid_4-col gap-xsmall text-align_center w-list-unstyled">
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <div className="eyebrow">30-Min Walks</div>
                <p className="heading_h3">€10/mo</p>
                <p>Perfect for quick strolls</p>
              </div>
              <div className="button-group is-align-center">
                <a href="#book" className="button w-button">
                  Book a Walk
                </a>
              </div>
              <p className="text-color_secondary">Pause or cancel anytime—no worries.</p>
            </div>
          </li>

          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <div className="eyebrow">60-Min Walks</div>
                <p className="heading_h3">€20/mo</p>
                <p>Great for active dogs</p>
              </div>
              <div className="button-group is-align-center">
                <a href="#reserve" className="button w-button">
                  Reserve Now
                </a>
              </div>
              <p className="text-color_secondary">Flexible scheduling for busy lives.</p>
            </div>
          </li>

          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <div className="eyebrow">120-min walks</div>
                <p className="heading_h3">€30/mo</p>
                <p>Half or full day options</p>
              </div>
              <div className="button-group is-align-center">
                <a href="#daycare" className="button w-button">
                  Join Day Care
                </a>
              </div>
              <p className="text-color_secondary">Your dog’s home away from home.</p>
            </div>
          </li>

          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <div className="eyebrow">Custom walk</div>
                <p className="heading_h3">Tailored</p>
                <p>Training, boarding &amp; more</p>
              </div>
              <div className="button-group is-align-center">
                <a href="#chat" className="button w-button">
                  Let’s Chat
                </a>
              </div>
              <p className="text-color_secondary">We’ll create the perfect plan together.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default PricingSection;
