import React from 'react';
import Layout from '../src/components/layout/Layout';
import '../src/assets/css/normalize.css';
import '../src/assets/css/webflow.css';
import '../src/assets/css/jeroen-paws.webflow.css';
import { AuthProvider } from '../src/context/AuthContext';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return (
    <>
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  );
}

export default MyApp;
