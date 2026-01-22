import React, { useCallback, useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Layout from '../src/components/layout/Layout';
import ConsentBanner from '../src/components/ConsentBanner';
import "../styles/globals.css";
import '../src/assets/css/normalize.css';
import '../src/assets/css/jeroenandpaws.css';
import '../src/assets/css/jeroen-paws.css';
import '../src/assets/css/backend.css';
import '/styles/profile.css';

import { AuthProvider } from '../src/context/AuthContext';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const gaTrackingId = process.env.NEXT_PUBLIC_GA4_ID;
  const [analyticsConsent, setAnalyticsConsent] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedConsent = window.localStorage.getItem('jp-analytics-consent');
    if (storedConsent === 'granted' || storedConsent === 'denied') {
      setAnalyticsConsent(storedConsent);
    }
  }, []);

  const handleConsent = useCallback((value) => {
    setAnalyticsConsent(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('jp-analytics-consent', value);
    }
  }, []);

  useEffect(() => {
    if (analyticsConsent !== 'granted') {
      return;
    }
    const handleRouteChange = (url) => {
      if (typeof window.gtag === 'function' && gaTrackingId) {
        window.gtag('config', gaTrackingId, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [analyticsConsent, gaTrackingId, router.events]);

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return (
    <>
      {gaTrackingId && analyticsConsent === 'granted' && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaTrackingId}');
            `}
          </Script>
        </>
      )}
      {gaTrackingId && analyticsConsent === null && (
        <ConsentBanner
          onAccept={() => handleConsent('granted')}
          onDecline={() => handleConsent('denied')}
        />
      )}
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  );
}

export default MyApp;
