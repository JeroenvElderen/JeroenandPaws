import React from 'react';

const ComponentsDivider = () => (
              <section id="Components-Divider" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <div>
                        <h2>Divider</h2>
                        <p className="text-color_secondary">Dividers have two types: horizontal and vertical</p>
                      </div>
                      <a href="https://developers.webflow.com/flowkit/components/divider" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                        <div>Read docs</div>
                        <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                            <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                          </svg></div>
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="grid_3-col gap-small">
                      <div className="sg_table-col">
                        <div className="sg_table-header-heading">Horizontal Primary</div>
                        <div className="sg_preview-solid">
                          <div className="sg_table-cell">
                            <div className="divider"></div>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-col">
                        <div className="sg_table-header-heading">Horizontal Secondary</div>
                        <div className="sg_preview-solid">
                          <div className="sg_table-cell">
                            <div className="divider is-secondary"></div>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-col">
                        <div className="sg_table-header-heading">Horizontal Accent</div>
                        <div className="sg_preview-solid">
                          <div className="sg_table-cell">
                            <div className="divider is-accent"></div>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-col">
                        <div className="sg_table-header-heading">Vertical Primary</div>
                        <div className="sg_preview-solid">
                          <div className="divider-vertical"></div>
                        </div>
                      </div>
                      <div className="sg_table-col">
                        <div className="sg_table-header-heading">Vertical Secondary</div>
                        <div className="sg_preview-solid">
                          <div className="divider-vertical is-secondary"></div>
                        </div>
                      </div>
                      <div className="sg_table-col">
                        <div className="sg_table-header-heading">Vertical Accent</div>
                        <div className="sg_preview-solid">
                          <div className="divider-vertical is-accent"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsDivider;
