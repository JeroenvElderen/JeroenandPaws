import {
  NavBar,
  HeroSection,
  WelcomeHighlights,
  ServicesSlider,
  AboutSection,
  TestimonialsSection,
  CallToAction,
  FAQSection,
  Footer,
} from '../components/home';

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
