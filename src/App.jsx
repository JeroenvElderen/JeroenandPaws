import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/normalize.css';
import './styles/webflow.css';
import './styles/jeroen-paws.webflow.css';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import DetailServices from './pages/DetailServices.jsx';
import Contact from './pages/Contact.jsx';
import FAQ from './pages/FAQ.jsx';
import { useWebflowBaseClasses } from './lib/useWebflowBaseClasses.js';
function AppContent() {
  useWebflowBaseClasses();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services/:serviceId" element={<DetailServices />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
