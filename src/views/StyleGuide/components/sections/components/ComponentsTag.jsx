import React from 'react';

const ComponentsTag = () => (
              <section id="Components-Tag" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <div>
                        <h2>Tags</h2>
                        <p className="text-color_secondary">Every type of tags have 2 properties: color and size.</p>
                      </div>
                      <a href="https://developers.webflow.com/flowkit/reference/flowkit-v-2-0-0/components/tag" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                        <div>Read docs</div>
                        <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                            <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                          </svg></div>
                      </a>
                    </div>
                  </div>
                  <div className="flex_horizontal gap-small mobile-l-vertical">
                    <div className="sg_table-col">
                      <div className="sg_table-header-heading">
                        <div>Primary</div>
                      </div>
                      <div className="sg_preview-solid">
                        <div className="tag_group">
                          <div className="tag">Tag Label</div>
                        </div>
                      </div>
                    </div>
                    <div className="sg_table-col">
                      <div className="sg_table-header-heading">
                        <div>Inerse</div>
                      </div>
                      <div className="sg_preview-solid">
                        <div className="tag_group">
                          <div className="tag is-inverse">Tag Label</div>
                        </div>
                      </div>
                    </div>
                    <div className="sg_table-col">
                      <div className="sg_table-header-heading">
                        <div>On Inverse</div>
                      </div>
                      <div className="sg_preview-solid-inverse">
                        <div className="tag on-inverse">Tag Label</div>
                      </div>
                    </div>
                    <div className="sg_table-col">
                      <div className="sg_table-header-heading">
                        <div>On Accent Primary</div>
                      </div>
                      <div className="sg_preview-solid-accent">
                        <div className="tag on-accent-primary">Tag Label</div>
                      </div>
                    </div>
                    <div className="sg_table-col sg_accent-secondary-visibility">
                      <div className="sg_table-header-heading">
                        <div>On Accent Secondary</div>
                      </div>
                      <div className="sg_preview-solid-accent sg_accent-secondary">
                        <div className="tag on-accent-secondary">Tag Label</div>
                      </div>
                    </div>
                    <div className="sg_table-col sg_accent-tertiary-visibility">
                      <div className="sg_table-header-heading">
                        <div>On Accent Tertiary</div>
                      </div>
                      <div className="sg_preview-solid-accent sg-accent-tertiary sg_preview-bordered">
                        <div className="tag on-accent-tertiary">Tag Label</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsTag;
