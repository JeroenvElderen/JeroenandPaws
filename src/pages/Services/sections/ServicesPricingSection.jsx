import React from 'react';
import { Link } from 'react-router-dom';

const ServicesPricingSection = () => (
  <section className="section is-secondary">
      <div className="container">
        <ul className="grid_3-col gap-small padding_none margin-bottom_none w-list-unstyled">
          <li id="walk-and-train">
            <div className="card on-secondary">
              <div className="card_body">
                <div className="margin-bottom_xsmall">
                  <div className="w-layout-hflex">
                    <h4 className="heading_h2 margin-bottom_none">$0</h4>
                  </div>
                  <p className="paragraph_small">Always free</p>
                </div>
                <div className="divider is-secondary"></div>
                <div className="margin-top_xsmall margin_bottom-auto">
                  <h5 className="heading_h3">Walk &amp; Train</h5>
                  <p>Perfect for daily walks and basic training. Flexible, friendly, and tailored to your dog’s needs.</p><br />
                  <p></p>
                </div>
                <div className="button-group margin-top_xsmall">
                  <Link to="/contact?service=walk-and-train" className="button w-inline-block">
                    <div>Book now</div>
                  </Link>
                </div>
              </div>
            </div>
            <ul aria-label="Plan features" className="margin-bottom_none margin-top_small w-list-unstyled">
              <li className="flex_horizontal gap-xxsmall">
                <p className="eyebrow">Includes:</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>30-min or custom walks</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Gentle, positive training</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Photo &amp; update after each visit</p>
              </li>
            </ul>
          </li>
          <li id="day-care">
            <div className="card on-secondary">
              <div className="card_body">
                <div className="margin-bottom_xsmall">
                  <div className="w-layout-hflex">
                    <h4 className="heading_h2 margin-bottom_none">$9</h4>
                  </div>
                  <p className="paragraph_small">Per walk</p>
                </div>
                <div className="divider is-secondary"></div>
                <div className="margin-top_xsmall margin_bottom-auto">
                  <h5 className="heading_h3">Day Care</h5>
                  <p>A safe, playful space for your dog while you’re busy. Half or full days, always supervised and fun.</p>
                </div>
                <div className="button-group margin-top_xsmall">
                  <Link to="/contact?service=day-care" className="button w-inline-block">
                    <div>Reserve</div>
                  </Link>
                </div>
              </div>
            </div>
            <ul aria-label="Plan features" className="margin-bottom_none margin-top_small w-list-unstyled">
              <li className="flex_horizontal gap-xxsmall">
                <p className="eyebrow">Includes:</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Social play &amp; enrichment</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Flexible drop-off &amp; pick-up</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Personalized care routines</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Daily photo updates</p>
              </li>
            </ul>
          </li>
          <li id="boarding">
            <div className="card on-secondary">
              <div className="card_body">
                <div className="margin-bottom_xsmall">
                  <div className="w-layout-hflex">
                    <h4 className="heading_h2 margin-bottom_none">$49</h4>
                  </div>
                  <p className="paragraph_small">Per night</p>
                </div>
                <div className="divider is-secondary"></div>
                <div className="margin-top_xsmall margin_bottom-auto">
                  <h5 className="heading_h3">Boarding</h5>
                  <p>Overnight stays in a loving home. Your dog enjoys comfort, structure, and plenty of attention.</p>
                </div>
                <div className="button-group margin-top_xsmall">
                  <Link to="/contact?service=boarding" className="button w-inline-block">
                    <div>Request</div>
                  </Link>
                </div>
              </div>
            </div>
            <ul aria-label="Plan features" className="margin-bottom_none margin-top_small w-list-unstyled">
              <li className="flex_horizontal gap-xxsmall">
                <p className="eyebrow">Includes:</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>24/7 supervision</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Daily walks &amp; playtime</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Medication if needed</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Updates &amp; photos</p>
              </li>
              <li className="flex_horizontal gap-xxsmall">
                <div className="icon is-xsmall is-background"><svg width="100%" height="100%" preserveaspectratio="xMidYMid meet" viewbox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" fill="currentColor"></path>
                  </svg></div>
                <p>Custom care requests</p>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </section>
);

export default ServicesPricingSection;