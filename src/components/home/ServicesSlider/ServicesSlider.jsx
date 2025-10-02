import React, { useRef } from "react";

const ServicesSlider = () => {
  const sliderMaskRef = useRef(null);

  const goNext = () => {
    const mask = sliderMaskRef.current;
    if (!mask) return;
    const slideWidth = mask.firstElementChild?.getBoundingClientRect().width || 0;
    mask.scrollBy({ left: slideWidth, behavior: "smooth" });
  };

  const goPrev = () => {
    const mask = sliderMaskRef.current;
    if (!mask) return;
    const slideWidth = mask.firstElementChild?.getBoundingClientRect().width || 0;
    mask.scrollBy({ left: -slideWidth, behavior: "smooth" });
  };

  return (
    <section className="section overflow_hidden">
      <div className="container">
        <div className="header is-align-center">
          <div className="eyebrow">Welcome to your dog's second home</div>
          <h2 className="heading_h2">Tailored care for every dog</h2>
        </div>

        <div
          data-delay="4000"
          data-animation="slide"
          className="slider overflow_visible w-slider"
          data-autoplay="false"
          data-easing="ease"
          data-hide-arrows="false"
          data-disable-swipe="false"
          data-autoplay-limit="0"
          data-nav-spacing="0"
          data-duration="500"
          data-infinite="true"
        >
          {/* --- SLIDER TRACK --- */}
          <div ref={sliderMaskRef} className="width_35percent width_100percent_tablet overflow_visible w-slider-mask">
            {/* Slide 1 */}
            <div className="ix_card-deck-space height_100percent w-slide">
              <div className="card overflow_hidden backdrop-filter_blur">
                <div className="card_body padding-bottom_none">
                  <p className="heading_h4">Personalized Training</p>
                  <p>
                    Our training sessions are designed to meet your dog's unique needs, ensuring they learn in a way
                    that's both effective and enjoyable.
                  </p>
                  <br />
                  <p>Learn more</p>
                </div>
                <div className="image-ratio_1x1 margin-top_xsmall">
                  <img
                    width="405"
                    height="405"
                    alt="animal training sessions"
                    src="images/0a9b8c7a-1447-4104-8895-8fe3cbbe946c.avif"
                    loading="lazy"
                    className="image_cover"
                  />
                </div>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="ix_card-deck-space height_100percent w-slide">
              <div className="card overflow_hidden backdrop-filter_blur">
                <div className="card_body padding-bottom_none">
                  <p className="heading_h4">Daily Walks</p>
                  <p>
                    From short strolls to extended adventures, our walks are perfect for keeping your dog happy and healthy.
                  </p>
                  <br />
                  <p>Explore options</p>
                </div>
                <div className="image-ratio_1x1 margin-top_xsmall">
                  <img
                    width="405"
                    height="405"
                    alt="daily dog walks"
                    src="images/99a7405c-2283-456c-bc54-94034e028144.avif"
                    loading="lazy"
                    className="image_cover"
                  />
                </div>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="ix_card-deck-space height_100percent w-slide">
              <div className="card overflow_hidden backdrop-filter_blur">
                <div className="card_body padding-bottom_none">
                  <p className="heading_h4">Boarding Services</p>
                  <p>
                    A safe and loving environment for your dog while you're away, with all the comforts of home.
                  </p>
                  <br />
                  <p>Book now</p>
                </div>
                <div className="image-ratio_1x1 margin-top_xsmall">
                  <img
                    width="405"
                    height="405"
                    alt="boarding services"
                    src="images/25c0c9d1-2e99-484e-817b-bf1e3505d5e8.avif"
                    loading="lazy"
                    className="image_cover"
                  />
                </div>
              </div>
            </div>

            {/* Slide 4 */}
            <div className="ix_card-deck-space height_100percent w-slide">
              <div className="card overflow_hidden backdrop-filter_blur">
                <div className="card_body padding-bottom_none">
                  <p className="heading_h4">Day Care</p>
                  <p>
                    Fun-filled days with plenty of play and socialization, ensuring your dog is well-cared for while you're at work.
                  </p>
                  <br />
                  <p>Join us</p>
                </div>
                <div className="image-ratio_1x1 margin-top_xsmall">
                  <img
                    width="405"
                    height="405"
                    alt="day care"
                    src="images/a58085e9-4555-461c-9f59-6029e44d0a55.avif"
                    loading="lazy"
                    className="image_cover"
                  />
                </div>
              </div>
            </div>

            {/* Slide 5 */}
            <div className="ix_card-deck-space height_100percent w-slide">
              <div className="card overflow_hidden backdrop-filter_blur">
                <div className="card_body padding-bottom_none">
                  <p className="heading_h4">Drop-In Visits</p>
                  <p>Quick visits to check in on your pet, providing them with the attention and care they need.</p>
                  <br />
                  <p>Schedule a visit</p>
                </div>
                <div className="image-ratio_1x1 margin-top_xsmall">
                  <img
                    width="405"
                    height="405"
                    alt="drop-in visits"
                    src="images/bc30b5db-c4fa-466a-a797-7ef1e270262b.avif"
                    loading="lazy"
                    className="image_cover"
                  />
                </div>
              </div>
            </div>

            {/* Slide 6 */}
            <div className="ix_card-deck-space height_100percent w-slide">
              <div className="card overflow_hidden backdrop-filter_blur">
                <div className="card_body padding-bottom_none">
                  <p className="heading_h4">Specialized Care</p>
                  <p>Expert care for dogs with specific needs, ensuring they receive the best possible attention.</p>
                  <br />
                  <p>Contact us</p>
                </div>
                <div className="image-ratio_1x1 margin-top_xsmall">
                  <img
                    width="405"
                    height="405"
                    alt="specialized care"
                    src="images/c3d7a736-6df4-460c-a24c-920315c472d6.avif"
                    loading="lazy"
                    className="image_cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- ARROWS --- */}
          <div
            className="slider_arrow is-previous is-bottom-center w-slider-arrow-left"
            onClick={goPrev}
            style={{ cursor: "pointer" }}
          >
            <div className="w-icon-slider-left"></div>
          </div>
          <div
            className="slider_arrow is-next is-bottom-center w-slider-arrow-right"
            onClick={goNext}
            style={{ cursor: "pointer" }}
          >
            <div className="w-icon-slider-right"></div>
          </div>

          <div className="display_none w-slider-nav w-slider-nav-invert w-round">Navigate</div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSlider;
