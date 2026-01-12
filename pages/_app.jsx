import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Layout from '../src/components/layout/Layout';
import "../styles/globals.css";
import '../src/assets/css/normalize.css';
import '../src/assets/css/jeroenandpaws.css';
import '../src/assets/css/jeroen-paws.css';
import '../src/assets/css/backend.css';
import '/styles/profile.css';

import { AuthProvider } from '../src/context/AuthContext';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window.gtag === 'function') {
        window.gtag('config', 'G-YV9Z1KJNWW', {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-YV9Z1KJNWW"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', 'G-YV9Z1KJNWW');
        `}
      </Script>
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  );
}

export default MyApp;
