import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <div>
        <h2>Jeroen &amp; Paws</h2>
        <p>Calm, ethical dog care across Bray and Wicklow.</p>
      </div>

      <div>
        <h3>Services</h3>
        <ul>
          <li><Link href="/services/dog-walking">Dog Walking</Link></li>
          <li><Link href="/services/daycare">Daycare</Link></li>
          <li><Link href="/services/boarding">Boarding</Link></li>
        </ul>
      </div>

      <div>
        <h3>Company</h3>
        <ul>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/book">Book</Link></li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
