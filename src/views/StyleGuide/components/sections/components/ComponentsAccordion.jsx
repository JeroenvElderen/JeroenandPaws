import React from 'react';

const ComponentsAccordion = () => (
              <section id="Components-Accordion" className="section is-secondary">
                <div className="flex_vertical gap-large">
                  <div className="container">
                    <div className="sg_section-heading-wrapper">
                      <div className="sg_heading-row">
                        <h2>Accordion</h2>
                        <a href="https://developers.webflow.com/flowkit/components/accordion" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                          <div>Read docs</div>
                          <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                              <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                            </svg></div>
                        </a>
                      </div>
                    </div>
                    <div className="flex_horizontal flex_vertical gap-large">
                      <div className="sg_card-wrapper">
                        <div className="sg_table-row sg_table-head">
                          <div className="sg_table-cell-title">
                            <div className="sg_table-header-heading">Title</div>
                          </div>
                          <div className="sg_table-cell">
                            <div className="sg_table-header-heading">Preview</div>
                          </div>
                        </div>
                        <div className="sg_table-row sg_border-bottom">
                          <div className="sg_table-cell-title">
                            <div>Accordion</div>
                          </div>
                          <div className="flex_vertical flex-child_expand">
                            <div data-delay="250" data-hover="false" className="accordion w-dropdown">
                              <div className="accordion_toggle w-dropdown-toggle">
                                <div className="accordion_icon w-icon-dropdown-toggle"></div>
                                <div>Accordion Label</div>
                              </div>
                              <nav className="accordion_content w-dropdown-list">
                                <div className="accordion_body">
                                  <div className="w-richtext">
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
                                  </div>
                                </div>
                              </nav>
                            </div>
                            <div data-delay="250" data-hover="false" className="accordion w-dropdown">
                              <div className="accordion_toggle w-dropdown-toggle">
                                <div className="accordion_icon w-icon-dropdown-toggle"></div>
                                <div>Accordion Label</div>
                              </div>
                              <nav className="accordion_content w-dropdown-list">
                                <div className="accordion_body">
                                  <div className="w-richtext">
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
                                  </div>
                                </div>
                              </nav>
                            </div>
                            <div data-delay="250" data-hover="false" className="accordion w-dropdown">
                              <div className="accordion_toggle w-dropdown-toggle">
                                <div className="accordion_icon w-icon-dropdown-toggle"></div>
                                <div>Accordion Label</div>
                              </div>
                              <nav className="accordion_content w-dropdown-list">
                                <div className="accordion_body">
                                  <div className="w-richtext">
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
                                  </div>
                                </div>
                              </nav>
                            </div>
                          </div>
                        </div>
                        <div className="sg_table-row sg_border-bottom">
                          <div className="sg_table-cell-title">
                            <div>Accordion opened</div>
                          </div>
                          <div className="sg_table-cell">
                            <div data-delay="250" data-hover="false" className="accordion w-dropdown">
                              <div className="accordion_toggle w-dropdown-toggle w--open">
                                <div className="accordion_icon w-icon-dropdown-toggle"></div>
                                <div>Accordion Label</div>
                              </div>
                              <nav className="accordion_content w-dropdown-list w--open">
                                <div className="accordion_body">
                                  <div className="w-richtext">
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
                                  </div>
                                </div>
                              </nav>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsAccordion;
