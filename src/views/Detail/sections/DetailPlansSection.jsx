import React from 'react';
import Link from 'next/link';

const DetailPlansSection = () => (
  <section data-record-id="9a353f57-64b8-2c0b-dbae-1b454003eb35" data-copilot="true" className="section is-secondary">
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
                <p>Perfect for quick strolls</p><br />
                <p></p>
              </div>
              <div className="w-layout-hflex button-group is-align-center margin-bottom_xsmall">
                <Link href="/contact?service=30-minute-walk" className="button w-button">Book a Walk</Link>
              </div>
              <p className="text-color_secondary">Pause or cancel anytime—no worries.</p>
            </div>
          </li>
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <div className="eyebrow">60-Min Walks</div>
                <p className="heading_h3">€20/mo</p>
                <p>Great for active dogs</p><br />
                <p></p>
              </div>
              <div className="w-layout-hflex button-group is-align-center margin-bottom_xsmall">
                <Link href="/contact?service=60-minute-walk" className="button w-button">Reserve Now</Link>
              </div>
              <p className="text-color_secondary">Flexible scheduling for busy lives.</p>
            </div>
          </li>
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <div className="eyebrow">120-min walks</div>
                <p className="heading_h3">€30/mo</p>
                <p>Half or full day options</p><br />
                <p></p>
              </div>
              <div className="w-layout-hflex button-group is-align-center margin-bottom_xsmall">
                <Link href="/contact?service=day-care" className="button w-button">Join Day Care</Link>
              </div>
              <p className="text-color_secondary">Your dog’s home away from home.</p>
            </div>
          </li>
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <div className="eyebrow">Custom walk</div>
                <p className="heading_h3">Tailored</p>
                <p>Training, boarding &amp; more</p><br />
                <p></p>
              </div>
              <div className="w-layout-hflex button-group is-align-center margin-bottom_xsmall">
                <Link href="/contact?service=custom-plan" className="button w-button">Let’s Chat</Link>
              </div>
              <p className="text-color_secondary">We’ll create the perfect plan together.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
);

export default DetailPlansSection;