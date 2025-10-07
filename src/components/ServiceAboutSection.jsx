import React from "react";

const ServiceAboutSection = ({
  eyebrow,
  title,
  description,
  highlights,
  statLabel,
  statValue,
  statCaption,
}) => {
  const descriptionParagraphs = Array.isArray(description)
    ? description
    : [description];

  return (
    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large align-start">
          <div className="flex_vertical gap-medium">
            {eyebrow && (
              <div className="eyebrow margin-bottom_none text-color_secondary">
                {eyebrow}
              </div>
            )}
            <h2 className="heading_h2 margin-bottom_small">{title}</h2>
            <div className="rich-text w-richtext">
              {descriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="flex_vertical gap-medium">
            {highlights && highlights.length > 0 && (
              <div className="flex_vertical gap-small">
                {highlights.map((highlight) => (
                  <div key={highlight.title} className="card is-secondary">
                    <div className="card_body is-small">
                      <h3 className="heading_h5 margin-bottom_xxsmall">
                        {highlight.title}
                      </h3>
                      <p className="text-color_secondary margin-bottom_none">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(statLabel || statValue || statCaption) && (
              <div className="card">
                <div className="card_body">
                  {statLabel && (
                    <div className="eyebrow margin-bottom_xxsmall text-color_secondary">
                      {statLabel}
                    </div>
                  )}
                  {statValue && (
                    <p className="heading_h3 margin-bottom_xxsmall">{statValue}</p>
                  )}
                  {statCaption && (
                    <p className="text-color_secondary margin-bottom_none">
                      {statCaption}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAboutSection;