import { useState } from 'react';
import '../styles/components/header.css';

const NAV_ITEMS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Questions', href: '#faqs' },
  { label: 'Contact', href: '#contact' }
];

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__inner">
        <a className="brand" href="#top" aria-label="Jeroen & Paws home">
          <span className="brand__mark" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M28 0H5a5 5 0 0 0-5 5v23a5 5 0 0 0 5 5h23a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5Zm1 17c-6.63 0-12 5.37-12 12h-1c0-6.63-5.37-12-12-12v-1c6.63 0 12-5.37 12-12h1c0 6.63 5.37 12 12 12v1Z" />
            </svg>
          </span>
          <span className="brand__text">Welcome to the space where your dog comes first.</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="2" y1="6" x2="22" y2="6" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="18" x2="22" y2="18" />
          </svg>
          <span className="sr-only">Toggle navigation</span>
        </button>

        <nav data-open={isOpen}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a className="nav__link" href={item.href} onClick={() => setIsOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__cta">
          <a className="nav__link" href="#pricing">
            Pricing
          </a>
          <a className="button button--primary" href="#contact">
            Reserve
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
