import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => (
  <footer className="footer is-inverse">
    <div className="container">
      <div className="w-layout-grid grid_5-col gap-small">
        <div id="w-node-_851d61a1-1dad-400a-5b6a-92b99f998536-b17c3d94" className="flex_vertical gap-small w-node-_8489c8c1-07dc-6ab4-cde4-f5c814a2d0ce-14a2d0cb">
          <Link href="/" className="logo w-inline-block">
            <div className="nav_logo-icon">
              <Image src="/logo1.svg" alt="Jeroen & Paws logo" className="nav_logo-image" width={50} height={50} />
            </div>
            <div data-brand-name="true" className="paragraph_xlarge margin-bottom_none text_all-caps">Jeroen &amp; Paws</div>
          </Link>
          <ul aria-label="Social media links" className="footer_icon-group margin_top-auto w-list-unstyled">
            <li className="margin-bottom_none">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer noopener" className="footer_icon-link w-inline-block"><svg width="100%" height="100%" viewBox="0 0 16 16">
                  <path d="M16,8.048a8,8,0,1,0-9.25,7.9V10.36H4.719V8.048H6.75V6.285A2.822,2.822,0,0,1,9.771,3.173a12.2,12.2,0,0,1,1.791.156V5.3H10.554a1.155,1.155,0,0,0-1.3,1.25v1.5h2.219l-.355,2.312H9.25v5.591A8,8,0,0,0,16,8.048Z" fill="currentColor"></path>
                </svg>
                <div className="screen-reader">Follow us on Facebook</div>
              </a>
            </li>
            <li className="margin-bottom_none">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer noopener" className="footer_icon-link w-inline-block"><svg width="100%" height="100%" viewBox="0 0 16 16">
                  <path d="M8,1.441c2.136,0,2.389.009,3.233.047a4.419,4.419,0,0,1,1.485.276,2.472,2.472,0,0,1,.92.6,2.472,2.472,0,0,1,.6.92,4.419,4.419,0,0,1,.276,1.485c.038.844.047,1.1.047,3.233s-.009,2.389-.047,3.233a4.419,4.419,0,0,1-.276,1.485,2.644,2.644,0,0,1-1.518,1.518,4.419,4.419,0,0,1-1.485.276c-.844.038-1.1.047-3.233.047s-2.389-.009-3.233-.047a4.419,4.419,0,0,1-1.485-.276,2.472,2.472,0,0,1-.92-.6,2.472,2.472,0,0,1-.6-.92,4.419,4.419,0,0,1-.276-1.485c-.038-.844-.047-1.1-.047-3.233s.009-2.389.047-3.233a4.419,4.419,0,0,1,.276-1.485,2.472,2.472,0,0,1,.6-.92,2.472,2.472,0,0,1,.92-.6,4.419,4.419,0,0,1,1.485-.276c.844-.038,1.1-.047,3.233-.047M8,0C5.827,0,5.555.009,4.7.048A5.868,5.868,0,0,0,2.76.42a3.908,3.908,0,0,0-1.417.923A3.908,3.908,0,0,0,.42,2.76,5.868,5.868,0,0,0,.048,4.7C.009,5.555,0,5.827,0,8s.009,2.445.048,3.3A5.868,5.868,0,0,0,.42,13.24a3.908,3.908,0,0,0,.923,1.417,3.908,3.908,0,0,0,1.417.923,5.868,5.868,0,0,0,1.942.372C5.555,15.991,5.827,16,8,16s2.445-.009,3.3-.048a5.868,5.868,0,0,0,1.942-.372,4.094,4.094,0,0,0,2.34-2.34,5.868,5.868,0,0,0,.372-1.942c.039-.853.048-1.125.048-3.3s-.009-2.445-.048-3.3A5.868,5.868,0,0,0,15.58,2.76a3.908,3.908,0,0,0-.923-1.417A3.908,3.908,0,0,0,13.24.42,5.868,5.868,0,0,0,11.3.048C10.445.009,10.173,0,8,0Z" fill="currentColor"></path>
                  <path d="M8,3.892A4.108,4.108,0,1,0,12.108,8,4.108,4.108,0,0,0,8,3.892Zm0,6.775A2.667,2.667,0,1,1,10.667,8,2.667,2.667,0,0,1,8,10.667Z" fill="currentColor"></path>
                  <circle cx="12.27" cy="3.73" r="0.96" fill="currentColor"></circle>
                </svg>
                <div className="screen-reader">Join us on Instagram</div>
              </a>
            </li>
          </ul>
        </div>
        <ul className="margin-bottom_none w-list-unstyled">
          <li>
            <h2 className="heading_h6 text-color_secondary">Our services</h2>
          </li>
          <li>
            <Link
              href="/services/daily-strolls#daily-strolls"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Daily strolls</div>
            </Link>
          </li>
          <li>
            <Link
              href="/services/group-adventures#group-adventures"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Group adventures</div>
            </Link>
          </li>
          <li>
            <Link
              href="/services/solo-journeys#solo-journeys"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Solo journey</div>
            </Link>
          </li>
          <li>
            <Link
              href="/services/overnight-stays#overnight-stays"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Overnight stay</div>
            </Link>
          </li>
          <li>
            <Link
              href="/services/daytime-care#daytime-care"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Daytime care</div>
            </Link>
          </li>
          <li>
            <Link
              href="/services/home-check-ins#home-check-ins"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Home check-ins</div>
            </Link>
          </li>
          <li>
            <Link
              href="/services/training-help#training-help"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Training</div>
            </Link>
          </li>
          <li>
            <Link
              href="/services/custom-solutions#custom-solutions"
              className="footer_link on-inverse w-inline-block"
            >
              <div>Custom solutions</div>
            </Link>
          </li>
        </ul>
        <ul className="margin-bottom_none w-list-unstyled">
          <li>
            <h2 className="heading_h6 text-color_secondary">Company info</h2>
          </li>
          <li>
            <Link href="/about" className="footer_link on-inverse w-inline-block">
              <div>About</div>
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="footer_link on-inverse w-inline-block">
              <div>Pricing</div>
            </Link>
          </li>
          <li>
            <Link href="/contact" className="footer_link on-inverse w-inline-block">
              <div>Contact</div>
            </Link>
          </li>
        </ul>
        <ul className="margin-bottom_none w-list-unstyled">
          <li>
            <h2 className="heading_h6 text-color_secondary">Support</h2>
          </li>
          <li>
            <Link href="/faq" className="footer_link on-inverse w-inline-block">
              <div>FAQ</div>
            </Link>
          </li>
          <li>
            <a href="mailto:jeroen@jeroenandpaws.com" className="footer_link on-inverse w-inline-block">
              <div>Help</div>
            </a>
          </li>
          {/*<li>
            <span className="footer_link on-inverse w-inline-block" aria-disabled="true">
              <div>Terms</div>
            </span>
          </li>
          <li>
            <span className="footer_link on-inverse w-inline-block" aria-disabled="true">
              <div>Policy</div>
            </span>
          </li>
          <li>
            <span className="footer_link on-inverse w-inline-block" aria-disabled="true">
              <div>Access</div>
            </span>
          </li> */}
        </ul>
      </div>
      <div className="divider margin-top_xsmall margin-bottom_xsmall"></div>
      <div className="footer_bottom">
        <div className="text-color_secondary">All rights reserved © 2025 Jeroen &amp; Paws</div>
        <ul className="button-group gap-xsmall margin-top_none w-list-unstyled">
          <li className="margin-bottom_none">
            <span className="footer_link on-inverse w-inline-block" aria-disabled="true">
              <div>Privacy</div>
            </span>
          </li>
          <li className="margin-bottom_none">
            <span className="footer_link on-inverse w-inline-block" aria-disabled="true">
              <div>Cookies</div>
            </span>
          </li>
          <li className="margin-bottom_none">
            <span className="footer_link on-inverse w-inline-block" aria-disabled="true">
              <div>Legal</div>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
