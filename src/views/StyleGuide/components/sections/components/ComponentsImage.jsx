import React from 'react';

const ComponentsImage = () => (
              <section id="Components-Image" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <h2>Images</h2>
                      <a href="https://developers.webflow.com/flowkit/components/images" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                        <div>Read docs</div>
                        <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                            <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                          </svg></div>
                      </a>
                    </div>
                  </div>
                  <div className="sg_grid">
                    <div className="sg_card-wrapper">
                      <div>
                        <div className="paragraph_large">Image</div>
                        <p className="text-color_secondary">Images are wrapped into a div with a class <span className="sg_selector">ratio_(value)</span>. It helps to control an aspect ratio of the image, takes care of overflow behavior and has a radius applied. </p>
                        <div className="sg_table-row sg_table-head">
                          <div className="sg_table-cell">
                            <div className="sg_table-header-heading">Preview</div>
                          </div>
                        </div>
                        <div className="image-ratio_auto"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image" /></div>
                      </div>
                    </div>
                    <div className="sg_card-wrapper">
                      <div>
                        <div className="paragraph_large">Avatar</div>
                        <p className="text-color_secondary">Avatar size can be adjusted with combo classes.</p>
                        <div className="sg_table-row sg_table-head">
                          <div className="sg_table-cell sg_cell-small">
                            <div className="sg_table-header-heading">Option</div>
                          </div>
                          <div className="sg_table-cell">
                            <div className="sg_table-header-heading">Preview</div>
                          </div>
                        </div>
                        <div className="flex_vertical gap-xsmall">
                          <div className="sg_table-row">
                            <div className="sg_table-cell sg_cell-small sg_table-cell-title">
                              <div>Small Avatar</div>
                            </div>
                            <div className="sg_table-cell">
                              <div className="avatar is-small"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover events_none" /></div>
                            </div>
                          </div>
                          <div className="sg_table-row">
                            <div className="sg_table-cell sg_cell-small sg_table-cell-title">
                              <div>Default Avatar</div>
                            </div>
                            <div className="sg_table-cell">
                              <div className="avatar"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover events_none" /></div>
                            </div>
                          </div>
                          <div className="sg_table-row">
                            <div className="sg_table-cell sg_cell-small sg_table-cell-title">
                              <div>Large Avatar</div>
                            </div>
                            <div className="sg_table-cell">
                              <div className="avatar is-large"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover events_none" /></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsImage;
