import { useEffect } from 'react';
import { NavBar, Footer } from '../../components/layout';
import { AboutHeroSection, ServicesSection, GallerySection } from '../../components/about';

const About = () => {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('w-mod-js')) root.classList.add('w-mod-js');
    if (
      !root.classList.contains('w-mod-touch') &&
      ('ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch))
    ) {
      root.classList.add('w-mod-touch');
    }

    if (window.Webflow) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require && window.Webflow.require('ix2').init();
    }
  }, []);

  return (
    <>
      <NavBar />
      <AboutHeroSection />
      <ServicesSection />
      <GallerySection />
      <Footer />
    </>
  );
};

export default About;
