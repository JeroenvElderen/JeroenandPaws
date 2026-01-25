import React from 'react';

const ComponentsButtons = () => (
              <section id="Components-Button" className="section is-secondary">
                <div className="flex_vertical gap-xlarge">
                  <div className="container">
                    <div>
                      <div className="sg_section-heading-wrapper">
                        <div className="sg_heading-row">
                          <div>
                            <h2>Buttons</h2>
                            <p className="text-color_secondary">Every type of buttons have 2 properties: color and size.</p>
                          </div>
                          <a href="https://developers.webflow.com/flowkit/components/buttons" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                            <div>Read docs</div>
                            <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                                <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                              </svg></div>
                          </a>
                        </div>
                      </div>
                      <div className="flex_vertical gap-xsmall">
                        <div className="sg_table-row sg_table-head">
                          <div className="sg_table-cell">
                            <div className="sg_grid-buttons">
                              <div className="sg_table-header-heading">Primary</div>
                              <div className="sg_table-header-heading">Preview</div>
                              <div className="sg_table-header-heading">Small Primary</div>
                              <div className="sg_table-header-heading">Small Secondary</div>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>Default</div>
                          </div>
                          <div className="sg_preview-solid sg_height-auto">
                            <div className="sg_grid-buttons">
                              <button type="button" className="button w-button">Button Text</button>
                              <button type="button" className="button is-secondary w-button">Button Text</button>
                              <button type="button" className="button is-small w-button">Button Text</button>
                              <button type="button" className="button is-secondary is-small w-button">Button Text</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Inverse</div>
                          </div>
                          <div className="sg_preview-solid-inverse sg_height-auto">
                            <div className="sg_grid-buttons">
                              <button type="button" className="button on-inverse w-button">Button Text</button>
                              <button type="button" className="button is-secondary on-inverse w-button">Button Text</button>
                              <button type="button" className="button is-small on-inverse w-button">Button Text</button>
                              <button type="button" className="button is-secondary is-small on-inverse w-button">Button Text</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Primary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg_height-auto">
                            <div className="sg_grid-buttons">
                              <button type="button" className="button on-accent-primary w-button">Button Text</button>
                              <button type="button" className="button is-secondary on-accent-primary w-button">Button Text</button>
                              <button type="button" className="button is-small on-accent-primary w-button">Button Text</button>
                              <button type="button" className="button is-secondary is-small on-accent-primary w-button">Button Text</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Secondary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg_accent-secondary sg_height-auto">
                            <div className="sg_grid-buttons">
                              <button type="button" className="button on-accent-secondary w-button">Button Text</button>
                              <button type="button" className="button is-secondary on-accent-secondary w-button">Button Text</button>
                              <button type="button" className="button on-accent-secondary is-small w-button">Button Text</button>
                              <button type="button" className="button is-secondary on-accent-secondary is-small w-button">Button Text</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Tertiary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg-accent-tertiary sg_height-auto sg_preview-bordered">
                            <div className="sg_grid-buttons">
                              <button type="button" className="button on-accent-tertiary w-button">Button Text</button>
                              <button type="button" className="button is-secondary on-accent-tertiary w-button">Button Text</button>
                              <button type="button" className="button on-accent-tertiary is-small w-button">Button Text</button>
                              <button type="button" className="button is-secondary on-accent-tertiary is-small w-button">Button Text</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="container">
                    <div className="grid_2-col gap-medium">
                      <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e5e3f-055fd1d7" className="flex_vertical gap-xsmall">
                        <div className="sg_table-head">
                          <div className="sg_table-cell-title">
                            <p className="paragraph_xlarge">Text Button</p>
                          </div>
                          <div className="grid_2-col">
                            <div className="sg_table-header-heading">Primary</div>
                            <div className="sg_table-header-heading">Small Secondary </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>Default</div>
                          </div>
                          <div className="sg_preview-solid sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-button w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                              <button type="button" className="text-button is-secondary is-small w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Inverse</div>
                          </div>
                          <div className="sg_preview-solid-inverse sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-button on-inverse w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                              <button type="button" className="text-button is-secondary is-small w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Primary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-button on-accent-primary w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                              <button type="button" className="text-button is-secondary is-small w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Secondary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg_accent-secondary sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-button on-accent-secondary w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                              <button type="button" className="text-button on-accent-secondary is-small w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Tertiary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg-accent-tertiary sg_height-auto sg_preview-bordered">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-button on-accent-tertiary w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                              <button type="button" className="text-button on-accent-tertiary is-small w-inline-block">
                                <div>Text Button</div>
                                <div className="text-button_icon w-embed"><svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 24H43M43 24L24.28 5M43 24L24.28 43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"></path>
                                  </svg></div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e5e8f-055fd1d7" className="flex_vertical gap-xsmall">
                        <div className="sg_table-head">
                          <div className="sg_table-cell-title">
                            <p className="paragraph_xlarge">Link</p>
                          </div>
                          <div className="grid_2-col">
                            <div className="sg_table-header-heading">Primary Link</div>
                            <div className="sg_table-header-heading">Small Secondary Link</div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>Default</div>
                          </div>
                          <div className="sg_preview-solid sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e5e9f-055fd1d7"  className="text-link">Text Link</button>
                              <button type="button" id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e5ea1-055fd1d7"  className="text-link is-secondary is-small">Text Link</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Inverse</div>
                          </div>
                          <div className="sg_preview-solid-inverse sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-link on-inverse">Text Link</button>
                              <button type="button" className="text-link on-inverse is-small">Text Link</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Primary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-link on-accent-primary">Text Link</button>
                              <button type="button" className="text-link on-accent-primary is-small">Text Link</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Secondary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg_accent-secondary sg_height-auto">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-link on-accent-secondary">Text Link</button>
                              <button type="button" className="text-link on-accent-secondary is-small">Text Link</button>
                            </div>
                          </div>
                        </div>
                        <div className="sg_col">
                          <div className="sg_table-cell-title">
                            <div>On Accent Tertiary</div>
                          </div>
                          <div className="sg_preview-solid-accent sg-accent-tertiary sg_height-auto sg_preview-bordered">
                            <div className="grid_2-col is-x-center width_100percent">
                              <button type="button" className="text-link on-accent-tertiary">Text Link</button>
                              <button type="button" className="text-link on-accent-tertiary is-small">Text Link</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsButtons;
