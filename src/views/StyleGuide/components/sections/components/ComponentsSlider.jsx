import React from 'react';

const ComponentsSlider = () => (
              <section id="Components-Slider" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <h2>Slider</h2>
                      <a href="https://developers.webflow.com/flowkit/components/slider" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                        <div>Read docs</div>
                        <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                            <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                          </svg></div>
                      </a>
                    </div>
                  </div>
                  <div className="flex_vertical gap-large">
                    <div className="flex_horizontal gap-small mobile-l-vertical">
                      <div className="sg_table-col">
                        <div className="sg_table-cell-title">Default</div>
                        <div className="sg_preview-solid">
                          <div data-delay="4000" data-animation="slide" className="slider w-slider" data-autoplay="false" data-easing="ease" data-hide-arrows="false" data-disable-swipe="false" data-autoplay-limit="0" data-nav-spacing="3" data-duration="500" data-infinite="true">
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e61ea-055fd1d7" className="slider_mask w-slider-mask">
                              <div className="w-slide"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover" /></div>
                              <div className="w-slide"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover" /></div>
                              <div className="w-slide"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover" /></div>
                            </div>
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e61f1-055fd1d7" className="slider_arrow is-prev-bottom w-slider-arrow-left">
                              <div className="w-icon-slider-left"></div>
                            </div>
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e61f3-055fd1d7" className="slider_arrow is-next-bottom w-slider-arrow-right">
                              <div className="w-icon-slider-right"></div>
                            </div>
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e61f5-055fd1d7" className="slider_nav w-slider-nav w-slider-nav-invert w-round"></div>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-col">
                        <div className="sg_table-cell-title">Inverse</div>
                        <div className="sg_preview-solid-inverse">
                          <div data-delay="4000" data-animation="slide" className="slider w-slider" data-autoplay="false" data-easing="ease" data-hide-arrows="false" data-disable-swipe="false" data-autoplay-limit="0" data-nav-spacing="3" data-duration="500" data-infinite="true">
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e61fb-055fd1d7" className="slider_mask w-slider-mask">
                              <div className="w-slide"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover" /></div>
                              <div className="w-slide"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover" /></div>
                              <div className="w-slide"><img loading="lazy" src="https://uploads-ssl.webflow.com/663ae41a035a5092ac55e30d/663ae41a035a5092ac55e325_image_placeholder.svg" alt="" className="image_cover" /></div>
                            </div>
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e6202-055fd1d7" className="slider_arrow is-inverse is-prev-bottom w-slider-arrow-left">
                              <div className="w-icon-slider-left"></div>
                            </div>
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e6204-055fd1d7" className="slider_arrow is-inverse is-next-bottom w-slider-arrow-right">
                              <div className="w-icon-slider-right"></div>
                            </div>
                            <div id="w-node-_6401b070-0ac8-bcf0-2647-73725f5e6206-055fd1d7" className="slider_nav w-slider-nav w-slider-nav-invert w-round"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsSlider;
