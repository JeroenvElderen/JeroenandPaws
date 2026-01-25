import React from "react";

const FoundationPalette = () => {
  return (
    <section id="Foundation-Palette" className="flex_vertical gap-xlarge">
      <div className="container">
        <div className="sg_section-heading-wrapper">
          <div className="sg_heading-row">
            <div>
              <h2>Color</h2>
              <p className="text-color_secondary text-width_medium">
                Foundation colors is a set of variables that should be applied to
                elements classes. Update colors by selecting an element (style
                panel) or in the variables panel.
              </p>
            </div>
            <a
              href="https://developers.webflow.com/flowkit/variables/color"
              target="_blank"
              rel="noreferrer noopener"
              className="text-button w-inline-block"
            >
              <div>Read docs</div>
              <div className="button_icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </a>
          </div>
        </div>

        <div className="sg_card-wrapper">
          <div className="margin-bottom_small">
            <div className="paragraph_xlarge">Core Colors</div>
            <div className="flex_horizontal tablet-vertical gap-small">
              <div className="sg_colors-column sg_main">
                <div className="sg_table-header-heading">Accent Primary</div>
                <div className="sg_color-combo">
                  <div className="sg_color-sample sg_primary"></div>
                  <div className="sg_color-sample sg_primary-hover">
                    <div className="text-color_on-accent-primary">Hover</div>
                  </div>
                </div>
              </div>

              <div className="sg_colors-column sg_main sg_accent-secondary-visibility">
                <div className="sg_table-header-heading">Accent Secondary</div>
                <div className="sg_color-combo">
                  <div className="sg_color-sample sg_secondary"></div>
                  <div className="sg_color-sample sg_secondary-hover">
                    <div className="text-color_on-accent-secondary">
                      Hover
                    </div>
                  </div>
                </div>
              </div>

              <div className="sg_colors-column sg_main sg_accent-tertiary-visibility">
                <div className="sg_table-header-heading">Accent Tertiary</div>
                <div className="sg_color-combo">
                  <div className="sg_color-sample sg_tertiary"></div>
                  <div className="sg_color-sample sg_tertiary-hover">
                    <div className="text-color_on-accent-tertiary sg_text-muted">
                      Hover
                    </div>
                  </div>
                </div>
              </div>

              <div className="sg_colors-column sg_main">
                <div className="sg_table-header-heading">Neutral Primary</div>
                <div className="sg_color-combo">
                  <div className="sg_color-sample sg_core-inverse"></div>
                  <div className="sg_color-sample sg_core-neutral">
                    <div className="sg_text-muted">Secondary</div>
                  </div>
                </div>
              </div>

              <div className="sg_colors-column">
                <div className="sg_table-header-heading">Neutral Inverse</div>
                <div className="sg_color-combo">
                  <div className="sg_color-sample sg_core-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Section */}
      <section className="container">
        <div className="sg_section-heading-wrapper">
          <p className="paragraph_xlarge">Background color</p>
          <p className="text-color_secondary">
            Section classes and background utility classes are using variables
            to adjust background and font color of nested text elements.
          </p>
        </div>

        <div className="flex_horizontal flex_vertical gap-large">
          <div className="grid_2-col gap-small">
            <div className="sg_table-col">
              <div className="sg_table-header-heading">
                <div>Primary (Default)</div>
              </div>
              <div className="section card">
                <div className="container">
                  <h2>Heading</h2>
                  <div>
                    Well-crafted paragraph text is more than just a collection of
                    letters.
                  </div>
                </div>
              </div>
            </div>

            <div className="sg_table-col">
              <div className="sg_table-header-heading">
                <div>Secondary</div>
              </div>
              <div className="section is-secondary card">
                <div className="container">
                  <h2>Heading</h2>
                  <div>
                    Well-crafted paragraph text is more than just a collection of
                    letters.
                  </div>
                </div>
              </div>
            </div>

            <div className="sg_table-col">
              <div className="sg_table-header-heading">
                <div>Accent Primary</div>
              </div>
              <div className="section is-accent-primary card">
                <div className="container">
                  <h2>Heading</h2>
                  <div>
                    Well-crafted paragraph text is more than just a collection of
                    letters.
                  </div>
                </div>
              </div>
            </div>

            <div className="sg_table-col">
              <div className="sg_table-header-heading">
                <div>Accent Secondary</div>
              </div>
              <div className="section is-accent-secondary card">
                <div className="container">
                  <h2>Heading</h2>
                  <div>
                    Well-crafted paragraph text is more than just a collection of
                    letters.
                  </div>
                </div>
              </div>
            </div>

            <div className="sg_table-col">
              <div className="sg_table-header-heading">
                <div>Accent Tertiary</div>
              </div>
              <div className="section is-accent-tertiary card">
                <div className="container">
                  <h2>Heading</h2>
                  <div>
                    Well-crafted paragraph text is more than just a collection of
                    letters.
                  </div>
                </div>
              </div>
            </div>

            <div className="sg_table-col">
              <div className="sg_table-header-heading">
                <div>Inverse</div>
              </div>
              <div className="section is-inverse card">
                <div className="container">
                  <h2>Heading</h2>
                  <div>
                    Well-crafted paragraph text is more than just a collection of
                    letters.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default FoundationPalette;