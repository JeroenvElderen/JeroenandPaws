import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home/Home';
import FAQ from './pages/FAQ/FAQ';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Dailystrolls from './pages/Services/Dailystrolls-service/Dailystrolls';
import CustomSolutions from './pages/Services/Custom-solutions/CustomSolutions';
import DaytimeCare from './pages/Services/Daytime-care/DaytimeCare';
import GroupAdventures from './pages/Services/Group-adventures/GroupAdventures';
import HomeCheckins from './pages/Services/Home-checkins/HomeCheckins';
import OvernightStays from './pages/Services/Overnight-stays/OvernightStays';
import SoloJourneys from './pages/Services/Solo-journeys/SoloJourneys';
import TrainingHelp from './pages/Services/Training-help/TrainingHelp';

import StyleGuide from './pages/StyleGuide/StyleGuide';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/faq" element={<Layout><FAQ /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/style-guide" element={<StyleGuide />} />

      {/* Services */}
      <Route path="/services/daily-strolls" element={<Layout><Dailystrolls /></Layout>} />
      <Route path="/services/group-adventures" element={<Layout><GroupAdventures /></Layout>} />
      <Route path="/services/solo-journeys" element={<Layout><SoloJourneys /></Layout>} />
      <Route path="/services/overnight-stays" element={<Layout><OvernightStays /></Layout>} />
      <Route path="/services/daytime-care" element={<Layout><DaytimeCare /></Layout>} />
      <Route path="/services/home-check-ins" element={<Layout><HomeCheckins /></Layout>} />
      <Route path="/services/training-help" element={<Layout><TrainingHelp /></Layout>} />
      <Route path="/services/custom-solutions" element={<Layout><CustomSolutions /></Layout>} />      
    </Routes>
  </Router> 
);

export default App;
