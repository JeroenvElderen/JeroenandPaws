import Layout from '../src/components/layout/Layout';
import '../src/assets/css/normalize.css';
import '../src/assets/css/webflow.css';
import '../src/assets/css/jeroen-paws.webflow.css';
import '../src/views/Booking/Booking.css';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
