import { Routes, Route } from './router';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { FaqPage } from './pages/FaqPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:serviceSlug" element={<ServiceDetailPage />} />
      <Route path="/faqs" element={<FaqPage />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
