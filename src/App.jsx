import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import './styles/normalize.css';
import './styles/webflow.css';
import './styles/jeroen-paws.webflow.css';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import DetailServices from './pages/DetailServices';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';

function WebflowReInit() {
  const location = useLocation();

  useEffect(() => {
    if (window.Webflow) {
      try {
        window.Webflow.destroy && window.Webflow.destroy();
        window.Webflow.ready && window.Webflow.ready();
        if (Array.isArray(window.Webflow)) {
          window.Webflow.forEach((fn) => fn());
        }
      } catch (err) {
        console.error('Webflow re-init error:', err);
      }
    }
  }, [location.pathname]);

  return null;
}

function AppContent() {
  const basePath = import.meta.env.BASE_URL;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('w-mod-js');
    if (
      'ontouchstart' in window ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)
    ) {
      root.classList.add('w-mod-touch');
    }

    const jqueryScript = document.createElement('script');
    jqueryScript.src =
      'https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68dbb5349c5fc9bb055fd17e';
    jqueryScript.integrity =
      'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=';
    jqueryScript.crossOrigin = 'anonymous';
    jqueryScript.async = false;

    const handleJQueryLoad = () => {
      const webflowScript = document.createElement('script');
      webflowScript.src = `${basePath}js/webflow.js`;
      webflowScript.async = false;
      document.body.appendChild(webflowScript);
    };

    jqueryScript.addEventListener('load', handleJQueryLoad);
    document.body.appendChild(jqueryScript);

    return () => {
      jqueryScript.removeEventListener('load', handleJQueryLoad);
      if (jqueryScript.parentNode) jqueryScript.parentNode.removeChild(jqueryScript);
    };
  }, [basePath]);

  return (
    <>
      <WebflowReInit />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:serviceId" element={<DetailServices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </>
  );
}

export default function App() {
  const basePath = import.meta.env.BASE_URL;

  return (
    <Router basename={basePath}>
      <AppContent />
    </Router>
  );
}
