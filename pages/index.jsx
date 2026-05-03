import Home from '../src/views/Home/Home';
import SeoMeta from '../src/components/SeoMeta';
import StructuredData from '../src/components/StructuredData';

export async function getStaticProps() {
    return {
        props: {},
        revalidate: 3600,
    }
}

const HomePage = () => (
  <>
    <SeoMeta
      title="Home"
      description="Trusted dog walking, home check-ins, daytime care, overnight stays, and custom pet care services."
    />
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Jeroen & Paws',
        url: 'https://jeroenandpaws.com',
        description:
          'Professional dog care services including walks, home check-ins, daytime care, and overnight stays.',
        areaServed: 'Local service area',
        serviceType: ['Dog Walking', 'Home Check-ins', 'Daytime Care', 'Overnight Stays'],
      }}
    />
    <Home />
  </>
);

export default HomePage;
