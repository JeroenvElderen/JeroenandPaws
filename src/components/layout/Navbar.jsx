import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePrefetchOnIntent } from '../../hooks/usePrefetchOnIntent';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const { getLinkProps } = usePrefetchOnIntent([
    '/about',
    '/gallery',
    '/faq',
        '/contact',
    '/services',
  ]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const closeAllMenus = useCallback(() => {
    closeMobileMenu();
  }, [closeMobileMenu]);

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
              sizes="50px"
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
              <Link
                href="/services"
                className="nav_link on-accent-primary w-inline-block"
                onClick={closeAllMenus}
                {...getLinkProps('/services')}
              >
                <div>Services</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <Link
                href="/about"
                className="nav_link on-accent-primary w-inline-block"
                onClick={closeAllMenus}
                {...getLinkProps('/about')}
              >
                <div>About me</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <Link
                href="/faq"
                className="nav_link on-accent-primary w-inline-block"
                onClick={closeAllMenus}
                {...getLinkProps('/faq')}
              >
                <div>Questions</div>
              </Link>
            </li>
            <li className="nav_menu-list-item">
              <Link
                href="/contact"
                className="nav_link on-accent-primary w-inline-block"
                onClick={closeAllMenus}
                {...getLinkProps('/contact')}
              >
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
