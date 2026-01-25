import React from 'react';

const ComponentsRichtext = () => (
              <section id="Components-Richtext" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <h2>Rich Text</h2>
                      <a href="https://developers.webflow.com/flowkit/components/richtext" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
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
                        <div className="sg_table-cell">
                          <div className="sg_table-header-heading">Preview</div>
                        </div>
                      </div>
                      <div className="sg_table-row">
                        <div className="sg_table-cell">
                          <div className="rich-text w-richtext">
                            <h1>Heading 1</h1>
                            <h2>Heading 2</h2>
                            <h3>Heading 3</h3>
                            <h4>Heading 4</h4>
                            <h5>Heading 5</h5>
                            <h6>Heading 6</h6>
                            <p>The rich text element allows you to create and format headings, paragraphs, blockquotes, images, and video all in one place instead of having to add and format them individually. Just double-click and easily create content.</p>
                            <ul>
                              <li>The rich text element allows you to create and format elements <ul>
                                  <li>List First Level<ul>
                                      <li>List Second Level</li>
                                    </ul>
                                  </li>
                                </ul>
                              </li>
                            </ul>
                            <ol start="">
                              <li>A rich text element can be used with static or dynamic content.</li>
                              <li>The rich text element allows you to create and format elements </li>
                            </ol>
                            <blockquote>A rich text element can be used with static or dynamic content. For static content, just drop it into any page and begin editing. For dynamic content, add a rich text field to any collection and then connect a rich text element to that field in the settings panel. Voila!</blockquote>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsRichtext;
