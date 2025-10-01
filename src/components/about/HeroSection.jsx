const AboutHeroSection = () => (
  <header className="section padding_none text-color_on-overlay is-inverse">
    <div className="w-layout-grid grid_1-col">
      <div className="position_relative min-height_80dvh radius_all-0">
        <img
          src="images/9278f40e-3f0d-4e2a-9ef4-7c47a3908e11.avif"
          alt="Jeroen sitting with a golden retriever in a sunny field"
          className="image_cover position_absolute radius_all-0"
          loading="lazy"
        />
        <div className="overlay_opacity-middle mask_bottom">
          Every adventure is built on calm leadership, play, and a whole lot of heart.
        </div>
      </div>
      <div className="container position_relative padding-vertical_xxlarge z-index_2">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large align-center">
          <div className="flex_vertical gap-small">
            <div className="eyebrow text-white">Meet your guide</div>
            <h1 className="heading_h1 text-white">I’m Jeroen – the person behind Jeroen &amp; Paws</h1>
            <p className="paragraph_large text-white">
              I help busy dog parents raise confident, fulfilled companions through structured adventures, clear communication,
              and daily rituals that feel like second nature.
            </p>
            <div className="button-group">
              <a href="#story" className="button on-inverse w-button">
                Explore the journey
              </a>
              <a href="mailto:hello@jeroenandpaws.com" className="button is-secondary on-inverse w-button">
                Book a meet &amp; greet
              </a>
            </div>
          </div>
          <div className="card is-contrast">
            <div className="card_body flex_vertical gap-small">
              <div className="eyebrow text-color_secondary">Quick facts</div>
              <div className="w-layout-grid grid_2-col tablet-1-col gap-small">
                <div className="flex_vertical gap-xxsmall">
                  <span className="heading_h3 margin-bottom_none">2500+</span>
                  <p className="paragraph_small text-color_secondary margin-bottom_none">Walks led since 2017</p>
                </div>
                <div className="flex_vertical gap-xxsmall">
                  <span className="heading_h3 margin-bottom_none">Certified</span>
                  <p className="paragraph_small text-color_secondary margin-bottom_none">Dog trainer &amp; first aid</p>
                </div>
                <div className="flex_vertical gap-xxsmall">
                  <span className="heading_h3 margin-bottom_none">Gentle leader</span>
                  <p className="paragraph_small text-color_secondary margin-bottom_none">Reward-based methods</p>
                </div>
                <div className="flex_vertical gap-xxsmall">
                  <span className="heading_h3 margin-bottom_none">Community</span>
                  <p className="paragraph_small text-color_secondary margin-bottom_none">Partnered with 6 rescues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default AboutHeroSection;