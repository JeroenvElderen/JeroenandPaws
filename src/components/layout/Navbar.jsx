import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
<div className="nav is-accent-primary">
    <div data-duration="400" data-animation="default" data-easing2="ease" data-easing="ease" data-collapse="medium" data-no-scroll="1" className="nav_container w-nav">
      <div className="nav_left">
        <Link to="/" className="nav_logo w-inline-block">
          <div className="nav_logo-icon"><svg width="100%" height="100%" viewbox="0 0 33 33" preserveaspectratio="xMidYMid meet">
              <path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"></path>
            </svg></div>
          <div data-brand-name="true" className="paragraph_large margin-bottom_none">Welcome to a place where your dog&#x27;s happiness is our top priority.</div>
        </Link>
      </div>
      <div className="nav_center">
        <nav aria-label="Primary" className="nav_menu w-nav-menu">
          <ul className="nav_menu-list w-list-unstyled">
            <li className="nav_menu-list-item">
              <div data-delay="0" data-hover="false" className="nav_dropdown-menu w-dropdown">
                <div className="nav_link on-accent-primary w-dropdown-toggle">
                  <div>Services</div>
                  <div className="nav-caret w-icon-dropdown-toggle"></div>
                </div>
                <nav className="mega-nav_dropdown-list w-dropdown-list">
                  <div className="mega-nav_dropdown-list-wrapper">
                    <ul className="grid_3-col tablet-1-col gap-medium margin-bottom_none w-list-unstyled">
                      <li id="w-node-_61be48fd-08da-7879-1198-67c4146a0181-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc673e-93dc6729">
                        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
                          <div>
                            <div className="eyebrow">Dog walking</div>
                            <ul className="mega-nav_list w-list-unstyled">
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=daily-strolls" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a018c-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6749-93dc6729">
                                    <div><strong>Daily strolls</strong></div>
                                    <div className="paragraph_small text-color_secondary">Tailored walks for your furry friend.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=group-adventures" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a0197-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6754-93dc6729">
                                    <div><strong>Group adventures</strong></div>
                                    <div className="paragraph_small text-color_secondary">Join friendly packs for social fun.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=solo-journeys" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01a2-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc675f-93dc6729">
                                    <div><strong>Solo journeys</strong></div>
                                    <div className="paragraph_small text-color_secondary">Dedicated care for your pet.</div>
                                  </div>
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <div className="eyebrow">Boarding</div>
                            <ul className="mega-nav_list w-list-unstyled">
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=overnight-stays" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01b1-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc676e-93dc6729">
                                    <div><strong>Overnight stays</strong></div>
                                    <div className="paragraph_small text-color_secondary">Safe and cozy nights.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=daytime-care" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01bc-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6779-93dc6729">
                                    <div><strong>Daytime care</strong></div>
                                    <div className="paragraph_small text-color_secondary">Engaging and secure day care.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=home-check-ins" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01c7-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6784-93dc6729">
                                    <div><strong>Home check-ins</strong></div>
                                    <div className="paragraph_small text-color_secondary">Quick visits for your pet&#x27;s needs.</div>
                                  </div>
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <div className="eyebrow">Other services</div>
                            <ul className="mega-nav_list w-list-unstyled">
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=pet-transport" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01d6-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6793-93dc6729">
                                    <div><strong>Pet transport</strong></div>
                                    <div className="paragraph_small text-color_secondary">Convenient travel for your pet.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=training-help" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01e1-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc679e-93dc6729">
                                    <div><strong>Training help</strong></div>
                                    <div className="paragraph_small text-color_secondary">Guidance for training essentials.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link to="/services/detail?plan=custom-solutions" className="mega-nav_link-item w-inline-block">
                                  <div className="icon is-medium on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 32 32" fill="currentColor">
                                      <path d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z" stroke-linejoin="round"></path>
                                    </svg></div>
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01ec-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc67a9-93dc6729">
                                    <div><strong>Custom solutions</strong></div>
                                    <div className="paragraph_small text-color_secondary">Personalized care plans.</div>
                                  </div>
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                      <li id="w-node-_61be48fd-08da-7879-1198-67c4146a01f2-d66a6ef8" className="flex_horizontal w-node-_41e4cb1a-a620-245f-7f74-dc8693dc67af-93dc6729">
                        <Link to="/contact" className="card-link is-inverse flex-child_expand w-inline-block">
                          <div className="card_body">
                            <div className="heading_h3">Plan your dog&#x27;s next adventure</div>
                            <p className="paragraph_small text-color_inverse-secondary">Book a walk, boarding, or custom care today.</p>
                            <div className="margin_top-auto">
                              <div className="button-group">
                                <div className="text-button is-secondary on-accent-primary">
                                  <div>Contact us</div>
                                  <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 16 16" fill="none">
                                      <path d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
                                    </svg></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
            </li>
            <li className="nav_menu-list-item">
              <Link to="/about" className="nav_link on-accent-primary w-inline-block">
                <div>About me</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <Link to="/faq" className="nav_link on-accent-primary w-inline-block">
                <div>Questions</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <Link to="/contact" className="nav_link on-accent-primary w-inline-block">
                <div>Contact</div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="nav_right">
        <div className="button-group margin-top_none">
          <Link to="/contact" className="button on-accent-primary w-inline-block">
            <div className="button_label">Reserve</div>
          </Link>
        </div>
      </div>
      <div className="nav_mobile-menu-button w-nav-button">
        <div className="icon on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24">
            <g className="nc-icon-wrapper" stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" fill="none" stroke="currentColor" stroke-miterlimit="10">
              <line x1="1" y1="12" x2="23" y2="12" stroke="currentColor"></line>
              <line x1="1" y1="5" x2="23" y2="5"></line>
              <line x1="1" y1="19" x2="23" y2="19"></line>
            </g>
          </svg></div>
      </div>
    </div>
  </div>
);

export default Navbar;