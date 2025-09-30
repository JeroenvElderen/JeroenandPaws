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
