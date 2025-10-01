const DetailServicesHeroSection = ({ data }) => {
  if (!data) return null;

  return (
    <header className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div className="header">
            <h1 className="heading_h1">{data.heading}</h1>
            <p className="subheading">{data.subheading}</p>
            <div className="button-group">
              {data.primary_cta_label && (
                <a href={data.primary_cta_url} className="button w-button">
                  {data.primary_cta_label}
                </a>
              )}
              {data.secondary_cta_label && (
                <a href={data.secondary_cta_url} className="button is-secondary w-button">
                  {data.secondary_cta_label}
                </a>
              )}
            </div>
          </div>

          {/* RIGHT IMAGE STACK */}
          <div className="position_relative flex_horizontal">
            <div className="custom_hero-right-offset">
              <div className="grid_9-col position_relative z-index_2">
                {data.hero_image_1_url && (
                  <div
                    id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea1f-edaeea0f"
                    className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d28-6cecf403"
                  >
                    <img
                      width="1216"
                      height="832"
                      src={data.hero_image_1_url}
                      alt={data.heading}
                      className="image image_cover"
                      loading="lazy"
                    />
                  </div>
                )}
                {data.hero_image_2_url && (
                  <div
                    id="w-node-_2eb957ac-a779-b7e8-c895-939eedaeea21-edaeea0f"
                    className="image-ratio_4x3 w-node-f1b26e5a-b33b-e9ba-a521-149172f27d2a-6cecf403"
                  >
                    <img
                      width="1216"
                      height="832"
                      src={data.hero_image_2_url}
                      alt={data.heading}
                      className="image image_cover shadow_xlarge"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DetailServicesHeroSection;
