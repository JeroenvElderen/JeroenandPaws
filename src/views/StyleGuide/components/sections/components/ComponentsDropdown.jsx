import React from 'react';

const ComponentsDropdown = () => (
              <section id="Components-Dropdown" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <h2>Dropdown</h2>
                      <a href="https://developers.webflow.com/flowkit/components/dropdown" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
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
                          <div>Dropdown</div>
                        </div>
                        <div className="sg_table-cell">
                          <div data-delay="250" data-hover="false" className="dropdown w-dropdown">
                            <div className="dropdown_toggle w-dropdown-toggle">
                              <div className="accordion_icon w-icon-dropdown-toggle"></div>
                              <div>Dropdown</div>
                            </div>
                            <nav className="dropdown_list w-dropdown-list">
                              <button type="button" className="w-dropdown-link">Link 1</button>
                              <button type="button" className="w-dropdown-link">Link 2</button>
                              <button type="button" className="w-dropdown-link">Link 3</button>
                            </nav>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-row">
                        <div className="sg_table-cell-title">
                          <div>Dropdown opened</div>
                        </div>
                        <div className="sg_table-cell sg_preview-lg">
                          <div data-delay="250" data-hover="false" id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e627a-055fd1d7" className="dropdown w-dropdown">
                            <div className="dropdown_toggle w-dropdown-toggle w--open">
                              <div className="accordion_icon w-icon-dropdown-toggle"></div>
                              <div>Dropdown</div>
                            </div>
                            <nav className="dropdown_list w-dropdown-list w--open">
                              <button type="button" className="w-dropdown-link">Long dropdown link, longer than toggle</button>
                              <button type="button" className="w-dropdown-link">Link 2</button>
                              <button type="button" className="w-dropdown-link">Link 3</button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsDropdown;
