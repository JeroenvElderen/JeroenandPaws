
import { useEffect } from 'react';
import './styles/normalize.css';
import './styles/webflow.css';
import './styles/jeroen-paws.webflow.css';
import { originalLayoutHtml } from './originalMarkup.js';

function App() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('w-mod-js');
    if ('ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch)) {
      root.classList.add('w-mod-touch');
    }

    const jqueryScript = document.createElement('script');
    jqueryScript.src =
      'https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68dbb5349c5fc9bb055fd17e';
    jqueryScript.integrity = 'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=';
    jqueryScript.crossOrigin = 'anonymous';
    jqueryScript.async = false;

    let webflowScript;
    const handleJQueryLoad = () => {
      webflowScript = document.createElement('script');
      webflowScript.src = '/js/webflow.js';
      webflowScript.async = false;
      document.body.appendChild(webflowScript);
    };

    jqueryScript.addEventListener('load', handleJQueryLoad);
    document.body.appendChild(jqueryScript);

    return () => {
      jqueryScript.removeEventListener('load', handleJQueryLoad);
      if (webflowScript && webflowScript.parentNode) {
        webflowScript.parentNode.removeChild(webflowScript);
      }
      if (jqueryScript.parentNode) {
        jqueryScript.parentNode.removeChild(jqueryScript);
      }
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: originalLayoutHtml }} />;
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import Highlights from './components/Highlights.jsx';
import Showcase from './components/Showcase.jsx';
import Testimonials from './components/Testimonials.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <Highlights />
        <Services />
        <Showcase />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default App;
