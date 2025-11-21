import { useRouter } from 'next/router';
import Contact from '../src/views/Contact/Contact';

const ContactPage = () => {
  const { query } = useRouter();
  const serviceId = typeof query.service === 'string' ? query.service : '';

  return <Contact serviceId={serviceId} />;
};

export default ContactPage;
