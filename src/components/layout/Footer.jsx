export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="brand">Jeroen &amp; Paws</p>
          <p className="footer-copy">Helping pets live their happiest lives.</p>
        </div>
        <div className="footer-meta">
          <a href="mailto:hello@jeroenandpaws.com" className="footer-link">
            hello@jeroenandpaws.com
          </a>
          <p className="footer-copy">&copy; {currentYear} Jeroen &amp; Paws. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
