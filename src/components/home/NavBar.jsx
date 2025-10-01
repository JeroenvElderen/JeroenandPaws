import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NavBar = () => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  const handleNavLinkClick = () => {
    setMobileOpen(false);
    setServicesOpen(false);
  };

  const toggleServicesMenu = () => {
    setServicesOpen((current) => !current);
  };

  const handleDropdownKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleServicesMenu();
    }

    if (event.key === 'Escape') {
      setServicesOpen(false);
    }
  };

  return (
    <div className="nav is-accent-primary">
      <div className={`nav_container w-nav ${mobileOpen ? 'w--open' : ''}`}>
        {/* Left logo */}
        <div className="nav_left">
          <Link to="/" className="nav_logo w-inline-block" onClick={handleNavLinkClick}>
            <div className="nav_logo-icon">
              <svg width="100%" height="100%" viewBox="0 0 33 33" preserveAspectRatio="xMidYMid meet">
                <path
                  d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <div className="paragraph_large margin-bottom_none">
              Welcome to a place where your dog's happiness is our top priority.
            </div>
          </Link>
        </div>

        {/* Center menu */}
        <div className="nav_center">
          <nav
            role="navigation"
            className={`nav_menu w-nav-menu ${mobileOpen ? 'w--open' : ''}`}
            style={{ display: mobileOpen ? 'block' : undefined }}
          >
            <ul role="list" className="nav_menu-list w-list-unstyled">
              {/* SERVICES DROPDOWN */}
              <li className="nav_menu-list-item">
                <div
                  className={`nav_dropdown-menu w-dropdown ${servicesOpen ? 'w--open' : ''}`}
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <div
                    className="nav_link on-accent-primary w-dropdown-toggle"
                    role="button"
                    tabIndex={0}
                    aria-expanded={servicesOpen}
                    onClick={toggleServicesMenu}
                    onKeyDown={handleDropdownKeyDown}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>Services</div>
                    <div className="nav-caret w-icon-dropdown-toggle"></div>
                  </div>

                  {servicesOpen && (
                    <nav className="mega-nav_dropdown-list w-dropdown-list">
                      <div className="mega-nav_dropdown-list-wrapper">
                        <ul className="grid_3-col tablet-1-col gap-medium margin-bottom_none w-list-unstyled">
                          <li className="w-node">
                            <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
                              {/* Column 1 */}
                              <div>
                                <div className="eyebrow">Dog walking</div>
                                <ul className="mega-nav_list w-list-unstyled">
                                  <li>
                                    <Link
                                      to="/services/daily-strolls"
                                      className="mega-nav_link-item w-inline-block"
                                      onClick={handleNavLinkClick}
                                    >
                                      <div className="icon is-medium on-accent-primary">
                                        {/* SVG omitted for brevity */}
                                      </div>
                                      <div>
                                        <strong>Daily strolls</strong>
                                        <div className="paragraph_small text-color_secondary">
                                          Tailored walks for your furry friend.
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      to="/services/group-adventures"
                                      className="mega-nav_link-item w-inline-block"
                                      onClick={handleNavLinkClick}
                                    >
                                      <div className="icon is-medium on-accent-primary">
                                        {/* SVG omitted for brevity */}
                                      </div>
                                      <div>
                                        <strong>Group adventures</strong>
                                        <div className="paragraph_small text-color_secondary">
                                          Join friendly packs for social fun.
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                              {/* Column 2 */}
                              <div>
                                <div className="eyebrow">Boarding</div>
                                <ul className="mega-nav_list w-list-unstyled">
                                  <li>
                                    <Link
                                      to="#"
                                      className="mega-nav_link-item w-inline-block"
                                      onClick={handleNavLinkClick}
                                    >
                                      <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                      <div>
                                        <strong>Overnight stays</strong>
                                        <div className="paragraph_small text-color_secondary">
                                          Safe and cozy nights.
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      to="#"
                                      className="mega-nav_link-item w-inline-block"
                                      onClick={handleNavLinkClick}
                                    >
                                      <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                      <div>
                                        <strong>Daytime care</strong>
                                        <div className="paragraph_small text-color_secondary">
                                          Engaging and secure day care.
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                              {/* Column 3 */}
                              <div>
                                <div className="eyebrow">Other services</div>
                                <ul className="mega-nav_list w-list-unstyled">
                                  <li>
                                    <Link
                                      to="#"
                                      className="mega-nav_link-item w-inline-block"
                                      onClick={handleNavLinkClick}
                                    >
                                      <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                      <div>
                                        <strong>Pet transport</strong>
                                        <div className="paragraph_small text-color_secondary">
                                          Convenient travel for your pet.
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      to="#"
                                      className="mega-nav_link-item w-inline-block"
                                      onClick={handleNavLinkClick}
                                    >
                                      <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                      <div>
                                        <strong>Training help</strong>
                                        <div className="paragraph_small text-color_secondary">
                                          Guidance for training essentials.
                                        </div>
                                      </div>
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </li>

                          {/* Adventure card on the right */}
                          <li className="flex_horizontal">
                            <Link
                              to="#"
                              className="card-link is-inverse flex-child_expand w-inline-block"
                              onClick={handleNavLinkClick}
                            >
                              <div className="card_body">
                                <div className="heading_h3">Plan your dog's next adventure</div>
                                <p className="paragraph_small text-color_inverse-secondary">
                                  Book a walk, boarding, or custom care today.
                                </p>
                                <div className="margin_top-auto">
                                  <div className="button-group">
                                    <div className="text-button is-secondary on-accent-primary">
                                      <div>Contact us</div>
                                      <div className="button_icon">{/* Arrow svg */}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </nav>
                  )}
                </div>
              </li>

              {/* Other top-level links */}
              <li className="nav_menu-list-item">
                <Link
                  to="/about"
                  className="nav_link on-accent-primary w-inline-block"
                  onClick={handleNavLinkClick}
                >
                  <div>About me</div>
                </Link>
              </li>
              <li className="nav_menu-list-item">
                <Link
                  to="/faq"
                  className="nav_link on-accent-primary w-inline-block"
                  onClick={handleNavLinkClick}
                >
                  <div>Questions</div>
                </Link>
              </li>
              <li className="nav_menu-list-item">
                <Link
                  to="/contact"
                  className="nav_link on-accent-primary w-inline-block"
                  onClick={handleNavLinkClick}
                >
                  <div>Contact</div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right side reserve button */}
        <div className="nav_right">
          <div className="button-group margin-top_none">
            <a href="#" className="button on-accent-primary w-inline-block" onClick={handleNavLinkClick}>
              <div className="button_label">Reserve</div>
            </a>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <div
          className={`nav_mobile-menu-button w-nav-button ${mobileOpen ? 'w--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="icon on-accent-primary">
            {/* Burger icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g
                className="nc-icon-wrapper"
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth="1.5"
                fill="none"
                stroke="currentColor"
                strokeMiterlimit="10"
              >
                <line x1="1" y1="12" x2="23" y2="12" stroke="currentColor"></line>
                <line x1="1" y1="5" x2="23" y2="5"></line>
                <line x1="1" y1="19" x2="23" y2="19"></line>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
