import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import StickyCta from './StickyCta';

const Layout = ({ children }) => (
  <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Navbar />
    <div id="main-content">{children}</div>
    <Footer />
    <StickyCta />
  </>
);

export default Layout;
