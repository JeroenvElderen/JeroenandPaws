import { useRouter } from 'next/router';
import Contact from '../src/views/Contact/Contact';
import SeoMeta from '../src/components/SeoMeta';

const ContactPage = () => {
  const { query } = useRouter();
  const serviceId = typeof query.service === 'string' ? query.service : '';

  return (
    <>
      <SeoMeta
        title="Contact"
        description="Get in touch to book services or ask questions about your dog's care plan."
      />
      <Contact serviceId={serviceId} />
    </>
  );
};

export default ContactPage;
