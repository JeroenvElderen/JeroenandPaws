import '../styles/components/footer.css';

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__brand-mark" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 33 33" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 0H5a5 5 0 0 0-5 5v23a5 5 0 0 0 5 5h23a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5Zm1 17c-6.63 0-12 5.37-12 12h-1c0-6.63-5.37-12-12-12v-1c6.63 0 12-5.37 12-12h1c0 6.63 5.37 12 12 12v1Z" />
              </svg>
            </span>
            <strong>Jeroen &amp; Paws</strong>
          </div>
          <nav className="footer__nav" aria-label="Footer navigation">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#faqs">FAQs</a>
            <a href="mailto:hello@jeroenandpaws.com">hello@jeroenandpaws.com</a>
          </nav>
          <div className="footer__cta">
            <strong>Ready to plan your pup&apos;s next adventure?</strong>
            <p>
              Share a few details and we&apos;ll schedule a consultation within 24 hours. We can also help coordinate
              transport and special requirements.
            </p>
            <a className="button button--primary" href="mailto:hello@jeroenandpaws.com">
              Start a conversation
            </a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>&copy; {new Date().getFullYear()} Jeroen &amp; Paws. All rights reserved.</span>
          <span>Crafted with care for web &amp; mobile.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
