import React from "react";

const DailystrollsFaqSection = () => {
  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Your Dog’s Second Home</h2>
          <p className="subheading">
            Everything you need to know about our dog care, training, and daily adventures—answered for you below.
          </p>
        </div>

        <div className="flex_vertical">
          <div className="accordion is-transparent w-dropdown">
            <div className="accordion_toggle-transparent w-dropdown-toggle">
              <div className="accordion_icon w-icon-dropdown-toggle"></div>
              <div className="paragraph_large margin-bottom_none">
                What services do you offer for dogs?
              </div>
            </div>
            <nav className="accordion_content w-dropdown-list">
              <p>
                We provide personalized dog training, daily walks (from 30 minutes to custom durations), boarding, day
                care, and drop-in visits. Every service is tailored to your dog’s unique needs.
              </p>
            </nav>
          </div>

          <div className="accordion is-transparent w-dropdown">
            <div className="accordion_toggle-transparent w-dropdown-toggle">
              <div className="accordion_icon w-icon-dropdown-toggle"></div>
              <div className="paragraph_large margin-bottom_none">
                How do you handle different dog personalities?
              </div>
            </div>
            <nav className="accordion_content w-dropdown-list">
              <p>
                With years of experience and a background in animal care, I adapt my approach to each dog — whether
                energetic, shy, or somewhere in between.
              </p>
            </nav>
          </div>

          <div className="accordion is-transparent w-dropdown">
            <div className="accordion_toggle-transparent w-dropdown-toggle">
              <div className="accordion_icon w-icon-dropdown-toggle"></div>
              <div className="paragraph_large margin-bottom_none">
                Can you care for special needs or senior dogs?
              </div>
            </div>
            <nav className="accordion_content w-dropdown-list">
              <p>
                Absolutely! I have experience with dogs of all ages and abilities, including those needing medication,
                extra patience, or special routines.
              </p>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailystrollsFaqSection;
