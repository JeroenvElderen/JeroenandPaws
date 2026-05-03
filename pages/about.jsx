import About from '../src/views/About/About';
import SeoMeta from '../src/components/SeoMeta';

const AboutPage = () => (
  <>
    <SeoMeta
      title="About"
      description="Learn about Jeroen & Paws and our approach to reliable, loving pet care."
    />
    <About />
  </>
);

export default AboutPage;
