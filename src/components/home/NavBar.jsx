import { Link } from "react-router-dom";
import { useEffect, useId, useState } from "react";

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navMenuId = useId();

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      setIsDropdownOpen(false);
    }
  }, [mobileOpen]);

  return (
    <div className="nav is-accent-primary">
      <div
        className={`nav_container w-nav ${mobileOpen ? "w--open" : ""}`}
        data-animation="default"
        data-collapse="medium"
        data-duration="400"
        data-easing="ease"
        data-easing2="ease"
        data-no-scroll="1"
        role="banner"
        style={{ maxWidth: "none" }}
      >
        {/* Logo */}
        <div className="nav_left">
          <Link to="/" className="nav_logo w-inline-block" onClick={closeMobileMenu}>
            <div className="nav_logo-icon">
              <svg width="100%" height="100%" viewBox="0 0 33 33">
                <path
                  d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="paragraph_large margin-bottom_none">
              Welcome to a place where your dog's happiness is our top priority.
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="nav_center">
          <nav
            id={navMenuId}
            role="navigation"
            className={`nav_menu w-nav-menu ${mobileOpen ? "w--open" : ""}`}
            data-nav-menu-open={mobileOpen ? "" : undefined}
            style={{ display: mobileOpen ? "block" : undefined }}
          >
            <ul className="nav_menu-list w-list-unstyled">
              {/* SERVICES DROPDOWN */}
              <li className="nav_menu-list-item">
                <div
                  className={`nav_dropdown-menu w-dropdown ${isDropdownOpen ? "w--open" : ""}`}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                  data-hover="false"
                  data-delay="0"
                >
                  <button
                    type="button"
                    className="nav_link on-accent-primary w-dropdown-toggle"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div>Services</div>
                    <div className="nav-caret w-icon-dropdown-toggle"></div>
                  </button>

                  <nav
                    className={`mega-nav_dropdown-list w-dropdown-list ${
                      isDropdownOpen ? "w--open" : ""
                    }`}
                    style={{ display: isDropdownOpen ? "block" : "none" }}
                  >
                    <div className="mega-nav_dropdown-list-wrapper">
                      <ul
                        className="grid_3-col tablet-1-col gap-medium margin-bottom_none w-list-unstyled"
                        role="list"
                      >
                        {/* Column group */}
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
                                    onClick={closeMobileMenu}
                                  >
                                    <div className="icon is-medium on-accent-primary">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="currentColor">
                                        <path d="m25.7 9.3-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z"></path>
                                      </svg>
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
                                    onClick={closeMobileMenu}
                                  >
                                    <div className="icon is-medium on-accent-primary">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="currentColor">
                                        <path d="m25.7 9.3-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z"></path>
                                      </svg>
                                    </div>
                                    <div>
                                      <strong>Group adventures</strong>
                                      <div className="paragraph_small text-color_secondary">
                                        Join friendly packs for social fun.
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#" className="mega-nav_link-item w-inline-block" onClick={closeMobileMenu}>
                                    <div className="icon is-medium on-accent-primary">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 32 32" fill="currentColor">
                                        <path d="m25.7 9.3-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z"></path>
                                      </svg>
                                    </div>
                                    <div>
                                      <strong>Solo journeys</strong>
                                      <div className="paragraph_small text-color_secondary">
                                        Dedicated care for your pet.
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
                                  <Link to="#" className="mega-nav_link-item w-inline-block" onClick={closeMobileMenu}>
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
                                  <Link to="#" className="mega-nav_link-item w-inline-block" onClick={closeMobileMenu}>
                                    <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                    <div>
                                      <strong>Daytime care</strong>
                                      <div className="paragraph_small text-color_secondary">
                                        Engaging and secure day care.
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#" className="mega-nav_link-item w-inline-block" onClick={closeMobileMenu}>
                                    <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                    <div>
                                      <strong>Home check-ins</strong>
                                      <div className="paragraph_small text-color_secondary">
                                        Quick visits for your pet's needs.
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
                                  <Link to="#" className="mega-nav_link-item w-inline-block" onClick={closeMobileMenu}>
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
                                  <Link to="#" className="mega-nav_link-item w-inline-block" onClick={closeMobileMenu}>
                                    <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                    <div>
                                      <strong>Training help</strong>
                                      <div className="paragraph_small text-color_secondary">
                                        Guidance for training essentials.
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                                <li>
                                  <Link to="#" className="mega-nav_link-item w-inline-block" onClick={closeMobileMenu}>
                                    <div className="icon is-medium on-accent-primary">{/* SVG */}</div>
                                    <div>
                                      <strong>Custom solutions</strong>
                                      <div className="paragraph_small text-color_secondary">
                                        Personalized care plans.
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </li>

                        {/* CTA card */}
                        <li className="flex_horizontal">
                          <Link
                            to="#"
                            className="card-link is-inverse flex-child_expand w-inline-block"
                            onClick={closeMobileMenu}
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
                </div>
              </li>

              {/* Other links */}
              <li className="nav_menu-list-item">
                <Link
                  to="/about"
                  className="nav_link on-accent-primary w-inline-block"
                  onClick={closeMobileMenu}
                >
                  About me
                </Link>
              </li>
              <li className="nav_menu-list-item">
                <Link
                  to="/faq"
                  className="nav_link on-accent-primary w-inline-block"
                  onClick={closeMobileMenu}
                >
                  Questions
                </Link>
              </li>
              <li className="nav_menu-list-item">
                <Link
                  to="/contact"
                  className="nav_link on-accent-primary w-inline-block"
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right reserve */}
        <div className="nav_right">
          <div className="button-group margin-top_none">
            <a href="#" className="button on-accent-primary w-inline-block" onClick={closeMobileMenu}>
              <div className="button_label">Reserve</div>
            </a>
          </div>
        </div>

        {/* Mobile toggle */}
        <div
          className={`nav_mobile-menu-button w-nav-button ${mobileOpen ? "w--open" : ""}`}
          aria-label="Toggle navigation menu"
          aria-controls={navMenuId}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMobileOpen((prev) => !prev);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="icon on-accent-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" fill="none" stroke="currentColor">
                <line x1="1" y1="12" x2="23" y2="12" />
                <line x1="1" y1="5" x2="23" y2="5" />
                <line x1="1" y1="19" x2="23" y2="19" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
