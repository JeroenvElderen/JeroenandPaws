import React from 'react';
import dynamic from 'next/dynamic';
import HomeHeroSection from './sections/HomeHeroSection';
import HomeIntroSection from './sections/HomeIntroSection';
import HomeAboutSection from './sections/HomeAboutSection';
import HomeCtaSection from './sections/HomeCtaSection';
import HomeFaqSection from './sections/HomeFaqSection';

const HomeSliderSection = dynamic(() => import('./sections/HomeSliderSection'));
const HomeTestimonialsSection = dynamic(() => import('./sections/HomeTestimonialsSection'));

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