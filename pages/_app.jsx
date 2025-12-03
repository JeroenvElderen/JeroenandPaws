import React from 'react';
import Layout from '../src/components/layout/Layout';
import "../styles/globals.css";
import '../src/assets/css/normalize.css';
import '../src/assets/css/jeroenandpaws.css';
import '../src/assets/css/jeroen-paws.css';
import '../src/assets/css/backend.css';

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
