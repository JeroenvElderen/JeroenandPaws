import NavBar from '../components/home/NavBar.jsx';
import Footer from '../components/home/Footer.jsx';
import { AboutHeroSection, ServicesSection, GallerySection } from '../components/about';

const About = () => {
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
