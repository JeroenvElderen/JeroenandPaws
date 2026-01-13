import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [isMegaNavOpen, setIsMegaNavOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileNavOpen, setIsProfileNavOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navRef = useRef(null);

  const closeMegaNav = useCallback(() => {
    setIsMegaNavOpen(false);
  }, []);

  const closeProfileNav = useCallback(() => {
    setIsProfileNavOpen(false);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const closeAllMenus = useCallback(() => {
    closeMegaNav();
    closeProfileNav();
    closeMobileMenu();
  }, [closeMegaNav, closeMobileMenu, closeProfileNav]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeAllMenus();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAllMenus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 991) {
        closeMobileMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [closeAllMenus, closeMobileMenu]);

  const toggleMegaNav = useCallback(() => {
    setIsMegaNavOpen((prev) => !prev);
  }, []);

  const toggleProfileNav = useCallback(() => {
    setIsProfileNavOpen((prev) => {
      if (!prev) closeMegaNav();
      return !prev;
    });
  }, [closeMegaNav]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <div className="nav is-accent-primary" ref={navRef}>
      <div
        data-duration="400"
        data-animation="default"
        data-easing2="ease"
        data-easing="ease"
        data-collapse="medium"
        data-no-scroll="1"
        className="nav_container w-nav"
      >
      <div className="nav_left">
        <Link href="/" className="nav_logo w-inline-block">
          <div className="nav_logo-icon">
            <Image
              src="/logo3.svg"
              alt="Jeroen & Paws logo"
              className="nav_logo-image"
              width={50}
              height={50}
              priority
            />
          </div>
        </Link>
      </div>
      <div className="nav_center">
        <nav
          aria-label="Primary"
          className={`nav_menu w-nav-menu${isMobileMenuOpen ? ' w--open' : ''}`}
          data-nav-menu-open={isMobileMenuOpen ? '' : undefined}
          id="primary-navigation"
        >
          <ul className="nav_menu-list w-list-unstyled">
            <li className="nav_menu-list-item">
              <div
                ref={dropdownRef}
                data-delay="0"
                data-hover="false"
                className={`nav_dropdown-menu w-dropdown${isMegaNavOpen ? ' w--open' : ''}`}
              >
                <div
                  className={`nav_link on-accent-primary w-dropdown-toggle${isMegaNavOpen ? ' w--open' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isMegaNavOpen}
                  onClick={toggleMegaNav}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleMegaNav();
                    }
                  }}
                >
                  <div>Services</div>
                  <div className="nav-caret w-icon-dropdown-toggle"></div>
                </div>
                <nav
                  className={`mega-nav_dropdown-list w-dropdown-list${isMegaNavOpen ? ' w--open' : ''}`}
                  aria-hidden={!isMegaNavOpen}
                >
                  <div className={`mega-nav_dropdown-list-wrapper${isMegaNavOpen ? ' w--open' : ''}`}>
                    <ul className="grid_3-col tablet-1-col gap-medium margin-bottom_none w-list-unstyled">
                      <li id="w-node-_61be48fd-08da-7879-1198-67c4146a0181-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc673e-93dc6729">
                        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
                          <div>
                            <div className="eyebrow">Dog walking</div>
                            <ul className="mega-nav_list w-list-unstyled">
                              <li className="margin-bottom_none">
                                <Link
                                  href="/services/daily-strolls"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a018c-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6749-93dc6729">
                                    <div><strong>Daily strolls</strong></div>
                                    <div className="paragraph_small text-color_secondary">Tailored walks for your furry friend.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link
                                  href="/services/group-adventures"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a0197-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6754-93dc6729">
                                    <div><strong>Group adventures</strong></div>
                                    <div className="paragraph_small text-color_secondary">Join friendly packs for social fun.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link
                                  href="/services/solo-journeys"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
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
                                <Link
                                  href="/services/overnight-stays"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01b1-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc676e-93dc6729">
                                    <div><strong>Overnight stays</strong></div>
                                    <div className="paragraph_small text-color_secondary">Safe and cozy nights.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link
                                  href="/services/daytime-care"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01bc-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc6779-93dc6729">
                                    <div><strong>Daytime care</strong></div>
                                    <div className="paragraph_small text-color_secondary">Engaging and secure day care.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link
                                  href="/services/home-check-ins"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
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
                                <Link
                                  href="/services/training-help"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
                                  <div id="w-node-_61be48fd-08da-7879-1198-67c4146a01e1-d66a6ef8" className="w-node-_41e4cb1a-a620-245f-7f74-dc8693dc679e-93dc6729">
                                    <div><strong>Training help</strong></div>
                                    <div className="paragraph_small text-color_secondary">Guidance for training essentials.</div>
                                  </div>
                                </Link>
                              </li>
                              <li className="margin-bottom_none">
                                <Link
                                  href="/services/custom-solutions"
                                  className="mega-nav_link-item w-inline-block"
                                  onClick={closeAllMenus}
                                >
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
                    </ul>
                  </div>
                </nav>
              </div>
            </li>
            <li className="nav_menu-list-item">
              <Link href="/about" className="nav_link on-accent-primary w-inline-block" onClick={closeAllMenus}>
                <div>About me</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <Link href="/gallery" className="nav_link on-accent-primary w-inline-block" onClick={closeAllMenus}>
                <div>Gallery</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <Link href="/faq" className="nav_link on-accent-primary w-inline-block" onClick={closeAllMenus}>
                <div>Questions</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <div
                data-delay="0"
                data-hover="false"
                className={`nav_dropdown-menu w-dropdown${isProfileNavOpen ? ' w--open' : ''}`}
              >
                <div
                  className={`nav_link on-accent-primary w-dropdown-toggle${isProfileNavOpen ? ' w--open' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isProfileNavOpen}
                  onClick={toggleProfileNav}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleProfileNav();
                    }
                  }}
                >
                  <div>Account</div>
                  <div className="nav-caret w-icon-dropdown-toggle"></div>
                </div>
                <nav
                  className={`dropdown_list w-dropdown-list${isProfileNavOpen ? ' w--open' : ''}`}
                  aria-hidden={!isProfileNavOpen}
                >
                  <Link
                    href="/profile"
                    className="w-dropdown-link"
                    onClick={closeAllMenus}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/resume-booking"
                    className="w-dropdown-link"
                    onClick={closeAllMenus}
                  >
                    Resume booking
                  </Link>
                </nav>
              </div>
            </li>
            {/* <li className ="nav_menu-list-item">
              <Link href="/booking" className="nav_link on-accent-primary w-inline-block" onClick={closeAllMenus}>
                  <div>
                    Booking
                  </div>
              </Link>
            </li> */}
            <li className="nav_menu-list-item">
              <Link href="/contact" className="nav_link on-accent-primary w-inline-block" onClick={closeAllMenus}>
                <div>Contact</div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="nav_right">
        
      </div>
      <div
        aria-controls="primary-navigation"
        aria-expanded={isMobileMenuOpen}
        className={`nav_mobile-menu-button w-nav-button${isMobileMenuOpen ? ' w--open' : ''}`}
        onClick={toggleMobileMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleMobileMenu();
          }
        }}
      >
        <div className="icon on-accent-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g className="nc-icon-wrapper" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" fill="none" stroke="currentColor" strokeMiterlimit="10">
              <line x1="1" y1="12" x2="23" y2="12" stroke="currentColor"></line>
              <line x1="1" y1="5" x2="23" y2="5"></line>
              <line x1="1" y1="19" x2="23" y2="19"></line>
            </g>
          </svg></div>
      </div>
      </div>
    </div>
  );
};

export default Navbar;

