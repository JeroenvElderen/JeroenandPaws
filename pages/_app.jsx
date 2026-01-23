import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Layout from '../src/components/layout/Layout';
const ConsentBanner = dynamic(() => import('../src/components/ConsentBanner'), {
  ssr: false,
});
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
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldEnableAnalytics = isProduction && gaTrackingId;
  const [analyticsConsent, setAnalyticsConsent] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);

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
    if (!shouldEnableAnalytics || analyticsConsent !== 'granted') {
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
  }, [analyticsConsent, gaTrackingId, router.events, shouldEnableAnalytics]);

  useEffect(() => {
    if (!shouldEnableAnalytics || analyticsConsent !== 'granted') {
      return;
    }

    let timeoutId;

    const markInteracted = () => {
      setHasInteracted(true);
      window.removeEventListener('pointerdown', markInteracted);
      window.removeEventListener('keydown', markInteracted);
      window.removeEventListener('scroll', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };

    window.addEventListener('pointerdown', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
    window.addEventListener('scroll', markInteracted, { once: true });
    window.addEventListener('touchstart', markInteracted, { once: true });

    timeoutId = window.setTimeout(() => {
      setHasInteracted(true);
    }, 3000);

    return () => {
      window.removeEventListener('pointerdown', markInteracted);
      window.removeEventListener('keydown', markInteracted);
      window.removeEventListener('scroll', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [analyticsConsent, shouldEnableAnalytics]);

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return (
    <>
      {shouldEnableAnalytics && analyticsConsent === 'granted' && hasInteracted && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
          />
          <Script id="ga4-init" strategy="lazyOnload">
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
      {shouldEnableAnalytics && analyticsConsent === null && (
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
