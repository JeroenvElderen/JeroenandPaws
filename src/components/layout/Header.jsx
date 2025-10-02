import { useState } from 'react';
import { NavLink } from '../../router';

const navigationLinks = [
  { label: 'Home', to: '/', exact: true },
  { label: 'Services', to: '/services' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Testimonials', to: '/testimonials' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          Jeroen &amp; Paws
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <nav className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}>
          <ul>
            {navigationLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  exact={link.exact}
                  className={({ isActive }) =>
                    isActive ? 'nav-link is-active' : 'nav-link'
                  }
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <a className="button button--primary" href="#care-plans" onClick={closeMenu}>
            Book a call
          </a>
        </nav>
      </div>
    </header>
  );
}
