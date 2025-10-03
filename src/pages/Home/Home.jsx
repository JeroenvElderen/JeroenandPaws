import React from 'react';
import HomeHeroSection from './sections/HomeHeroSection';
import HomeIntroSection from './sections/HomeIntroSection';
import HomeSliderSection from './sections/HomeSliderSection';
import HomeAboutSection from './sections/HomeAboutSection';
import HomeTestimonialsSection from './sections/HomeTestimonialsSection';
import HomeCtaSection from './sections/HomeCtaSection';
import HomeFaqSection from './sections/HomeFaqSection';

const Home = () => (
  <main>
    <HomeHeroSection />
    <HomeIntroSection />
    <HomeSliderSection />
    <HomeAboutSection />
    <HomeTestimonialsSection />
    <HomeCtaSection />
    <HomeFaqSection />
  </main>
);

export default Home;