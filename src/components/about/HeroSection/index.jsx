const HeroSection = () => (
  <header
    data-copilot="true"
    className="section max-height_100vh_desktop overflow_hidden flex_horizontal"
  >
    <div className="container">
      <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
        <div className="rotate_-12deg tablet-straight">
          <div className="w-layout-grid grid_1-col gap-small">
            <div className="image-ratio_3x2">
              <img
                alt="image of a vet assisting an animal"
                src="/images/d801bc7b-4e2e-4836-8ed2-f4f819ecc79a.avif"
                width="1193"
                height="795"
                loading="lazy"
                data-aisg-image-id="adfe4de3-4bd2-485f-9f46-d2394c32d69a"
                className="image_cover"
              />
            </div>
            <div className="image-ratio_3x2">
              <img
                alt="image of volunteers helping animals"
                src="https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/1705e9bf-d4c9-4680-8ee2-9419f7174673.avif"
                loading="lazy"
                data-aisg-image-id="1705e9bf-d4c9-4680-8ee2-9419f7174673"
                className="image_cover"
              />
            </div>
          </div>
        </div>
        <div
          id="w-node-_857eff80-a064-80f6-efa6-2aa55402b17a-5402b172"
          className="header w-node-aca1decb-952a-6d03-8948-04348d12084d-0653ac4e"
        >
          <h1 className="heading_h1">Care for every wagging tail</h1>
          <p className="subheading">
            Personalized dog training, walks, and loving care—tailored for every
            pup. From energetic walks to cozy boarding, your dog’s happiness and
            safety come first. Let’s make every day their best day.
          </p>
          <div className="button-group">
            <a href="#" className="button w-button">
              Book now
            </a>
            <a href="#" className="button is-secondary w-button">
              See services
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default HeroSection;
