import { NavBar, Footer } from '../components/home';
import { ContactHeroSection, ContactFormSection } from '../components/contact';

const Contact = () => {
  return (
    <>
      <NavBar />
      <ContactHeroSection />
      <ContactFormSection />
      <Footer />
    </>
  );
};

export default Contact;