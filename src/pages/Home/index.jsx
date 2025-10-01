import { NavBar, Footer } from '../../components/layout';
import {
  HeroSection,
  WelcomeHighlights,
  ServicesSlider,
  AboutSection,
  TestimonialsSection,
  CallToAction,
  FAQSection,
} from '../../components/home';

function Home() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <WelcomeHighlights />
      <ServicesSlider />
      <AboutSection />
      <TestimonialsSection />
      <CallToAction />
      <FAQSection />
      <Footer />
    </>
  );
}

export default Home;
