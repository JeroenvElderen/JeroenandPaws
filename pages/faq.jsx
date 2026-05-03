import FAQ from '../src/views/FAQ/FAQ';
import SeoMeta from '../src/components/SeoMeta';
import StructuredData from '../src/components/StructuredData';

const FaqPage = () => (
  <>
    <SeoMeta
      title="FAQ"
      description="Find answers to common questions about scheduling, pricing, and pet care."
    />
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I book a service?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Use the contact page to request a booking and share your preferred service and schedule.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which services are available?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Services include daily strolls, home check-ins, daytime care, overnight stays, and custom solutions.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can care be customized for my dog?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Care plans can be tailored for your dog’s age, routine, energy level, and training needs.',
            },
          },
        ],
      }}
    />
    <FAQ />
  </>
);

export default FaqPage;
