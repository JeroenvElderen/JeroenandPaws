import { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          Jeroen &amp; Paws
        </Link>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          className={styles.menuButton}
          onClick={() => setOpen((previous) => !previous)}
        >
          ☰
        </button>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`} aria-label="Main navigation">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/book" className={styles.cta} onClick={() => setOpen(false)}>
            Book a Meet &amp; Greet
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
