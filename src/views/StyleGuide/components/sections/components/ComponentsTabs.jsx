import React from 'react';

const ComponentsTabs = () => (
              <section id="Components-Tabs" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <h2>Tabs</h2>
                      <a href="https://developers.webflow.com/flowkit/components/tabs" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                        <div>Read docs</div>
                        <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                            <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                          </svg></div>
                      </a>
                    </div>
                  </div>
                  <div className="flex_horizontal flex_vertical gap-large">
                    <div className="flex_vertical gap-large">
                      <div className="flex_horizontal gap-medium tablet-vertical">
                        <div className="sg_table-col">
                          <div className="sg_table-cell-title">On Primary</div>
                          <div className="section sg_card-wrapper width_100percent">
                            <div data-current="Tab 2" data-easing="ease" data-duration-in="300" data-duration-out="100" className="w-tabs">
                              <div className="tabs_nav w-tab-menu">
                                <button type="button" data-w-tab="Tab 1"  className="tab_menu-button w-inline-block w-tab-link">
                                  <div>Tab 1</div>
                                </button>
                                <button type="button" data-w-tab="Tab 2"  className="tab_menu-button w-inline-block w-tab-link w--current">
                                  <div>Tab 2</div>
                                </button>
                              </div>
                              <div className="tabs_content w-tab-content">
                                <div data-w-tab="Tab 1" className="w-tab-pane">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                                <div data-w-tab="Tab 2" className="w-tab-pane w--tab-active">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="sg_table-col">
                          <div className="sg_table-cell-title">Tab Underline Style</div>
                          <div className="section sg_card-wrapper width_100percent">
                            <div data-current="Tab 1" data-easing="ease" data-duration-in="300" data-duration-out="100" className="w-tabs">
                              <div className="tabs_nav w-tab-menu">
                                <button type="button" data-w-tab="Tab 1"  className="tab_menu-link w-inline-block w-tab-link w--current">
                                  <div>Tab 1</div>
                                </button>
                                <button type="button" data-w-tab="Tab 2"  className="tab_menu-link w-inline-block w-tab-link">
                                  <div>Tab 2</div>
                                </button>
                              </div>
                              <div className="tabs_content w-tab-content">
                                <div data-w-tab="Tab 1" className="w-tab-pane w--tab-active">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                                <div data-w-tab="Tab 2" className="w-tab-pane">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="sg_table-col">
                          <div className="sg_table-cell-title">On Inverse</div>
                          <div className="sg_card-wrapper width_100percent section is-inverse">
                            <div data-current="Tab 1" data-easing="ease" data-duration-in="300" data-duration-out="100" className="w-tabs">
                              <div className="tabs_nav w-tab-menu">
                                <button type="button" data-w-tab="Tab 1"  className="tab_menu-button on-inverse w-inline-block w-tab-link w--current">
                                  <div>Tab 1</div>
                                </button>
                                <button type="button" data-w-tab="Tab 2"  className="tab_menu-button on-inverse w-inline-block w-tab-link">
                                  <div>Tab 2</div>
                                </button>
                              </div>
                              <div className="tabs_content w-tab-content">
                                <div data-w-tab="Tab 1" className="w-tab-pane w--tab-active">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                                <div data-w-tab="Tab 2" className="w-tab-pane">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex_horizontal gap-medium tablet-vertical">
                        <div className="sg_table-col">
                          <div className="sg_table-cell-title">On Accent Primary</div>
                          <div className="sg_card-wrapper width_100percent section is-accent-primary">
                            <div data-current="Tab 1" data-easing="ease" data-duration-in="300" data-duration-out="100" className="w-tabs">
                              <div className="tabs_nav w-tab-menu">
                                <button type="button" data-w-tab="Tab 1"  className="tab_menu-button on-accent-primary w-inline-block w-tab-link w--current">
                                  <div>Tab 1</div>
                                </button>
                                <button type="button" data-w-tab="Tab 2"  className="tab_menu-button on-accent-primary w-inline-block w-tab-link">
                                  <div>Tab 2</div>
                                </button>
                              </div>
                              <div className="tabs_content w-tab-content">
                                <div data-w-tab="Tab 1" className="w-tab-pane w--tab-active">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                                <div data-w-tab="Tab 2" className="w-tab-pane">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="sg_table-col sg_accent-secondary-visibility">
                          <div className="sg_table-cell-title">On Accent Secondary</div>
                          <div className="sg_card-wrapper width_100percent section is-accent-secondary sg_accent-secondary-visibility">
                            <div data-current="Tab 1" data-easing="ease" data-duration-in="300" data-duration-out="100" className="w-tabs">
                              <div className="tabs_nav w-tab-menu">
                                <button type="button" data-w-tab="Tab 1"  className="tab_menu-button on-accent-secondary w-inline-block w-tab-link w--current">
                                  <div>Tab 1</div>
                                </button>
                                <button type="button" data-w-tab="Tab 2"  className="tab_menu-button on-accent-secondary w-inline-block w-tab-link">
                                  <div>Tab 2</div>
                                </button>
                              </div>
                              <div className="tabs_content w-tab-content">
                                <div data-w-tab="Tab 1" className="w-tab-pane w--tab-active">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                                <div data-w-tab="Tab 2" className="w-tab-pane">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="sg_table-col sg_accent-tertiary-visibility">
                          <div className="sg_table-cell-title">On Accent Tertiary</div>
                          <div className="sg_card-wrapper width_100percent section is-accent-tertiary sg_card-accent-tertiary sg_accent-tertiary-visibility">
                            <div data-current="Tab 2" data-easing="ease" data-duration-in="300" data-duration-out="100" className="w-tabs">
                              <div className="tabs_nav w-tab-menu">
                                <button type="button" data-w-tab="Tab 1"  className="tab_menu-button on-accent-tertiary w-inline-block w-tab-link">
                                  <div>Tab 1</div>
                                </button>
                                <button type="button" data-w-tab="Tab 2"  className="tab_menu-button on-accent-tertiary w-inline-block w-tab-link w--current">
                                  <div>Tab 2</div>
                                </button>
                              </div>
                              <div className="tabs_content w-tab-content">
                                <div data-w-tab="Tab 1" className="w-tab-pane">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                                <div data-w-tab="Tab 2" className="w-tab-pane w--tab-active">
                                  <div className="sg_section-border padding_large text-align_center">
                                    <div className="sg_text-muted">This is some text inside of a tab block.</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsTabs;
