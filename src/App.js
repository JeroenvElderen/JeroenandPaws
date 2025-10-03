import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Detail from './pages/Detail/Detail';
import FAQ from './pages/FAQ/FAQ';
import Services from './pages/Services/Services';
import StyleGuide from './pages/StyleGuide/StyleGuide';

const App = () => (
  <Router>
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <About />
          </Layout>
        }
      />
      <Route
        path="/services"
        element={
          <Layout>
            <Services />
          </Layout>
        }
      />
      <Route
        path="/services/detail"
        element={
          <Layout>
            <Detail />
          </Layout>
        }
      />
      <Route
        path="/faq"
        element={
          <Layout>
            <FAQ />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <Contact />
          </Layout>
        }
      />
      <Route path="/style-guide" element={<StyleGuide />} />
    </Routes>
  </Router>
);

export default App;