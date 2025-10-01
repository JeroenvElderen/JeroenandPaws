import NavBar from '../components/home/NavBar.jsx';
import Footer from '../components/home/Footer.jsx';
import { AboutHeroSection, JourneySection, ValuesSection, CommunitySection } from '../components/about';

const About = () => (
  <>
    <NavBar />
    <AboutHeroSection />
    <JourneySection />
    <ValuesSection />
    <CommunitySection />
    <Footer />
  </>
);

export default About;