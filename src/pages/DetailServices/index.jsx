import { useEffect } from 'react';
import { NavBar, Footer } from '../../components/layout';
import {
  DetailServicesHeroSection,
  CarePlansSection,
  ServicesFAQSection,
} from '../../components/detailServices';

const heroContent = {
  heading: 'Expert Dog Care, Tailored For You',
  subheading:
    'From training to daily walks, boarding, and daycare—your dog’s happiness and well-being are my top priority. Let’s create a routine that fits your life and your pup’s needs.',
  primary_cta_label: 'Book a Meet & Greet',
  primary_cta_url: '#',
  secondary_cta_label: 'See Services & Pricing',
  secondary_cta_url: '#',
  hero_image_1_url: '/images/2b4d97a3-883d-4557-abc5-8cf8f3f95400.avif',
  hero_image_2_url: '/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif',
};

const carePlans = [
  {
    id: 'plan-30',
    title: '30-Min Walks',
    price: '€10/mo',
    description: 'Perfect for quick strolls',
    button_label: 'Book a Walk',
    button_url: '#',
    footnote: 'Pause or cancel anytime—no worries.',
  },
  {
    id: 'plan-60',
    title: '60-Min Walks',
    price: '€20/mo',
    description: 'Great for active dogs',
    button_label: 'Reserve Now',
    button_url: '#',
    footnote: 'Flexible scheduling for busy lives.',
  },
  {
    id: 'plan-120',
    title: '120-min walks',
    price: '€30/mo',
    description: 'Half or full day options',
    button_label: 'Join Day Care',
    button_url: '#',
    footnote: 'Your dog’s home away from home.',
  },
  {
    id: 'plan-custom',
    title: 'Custom walk',
    price: 'Tailored',
    description: 'Training, boarding & more',
    button_label: 'Let’s Chat',
    button_url: '#',
    footnote: 'We’ll create the perfect plan together.',
  },
];

const serviceFaqs = [
  {
    id: 'faq-services',
    question: 'What services do you offer for dogs?',
    answer:
      'We provide personalized dog training, daily walks (from 30 minutes to custom durations), boarding, day care (half and full days), and drop-in visits. Every service is tailored to your dog’s unique needs, ensuring comfort, safety, and fun.',
  },
  {
    id: 'faq-personalities',
    question: 'How do you handle different dog personalities?',
    answer:
      'With over 7 years of experience and a background in animal care, I adapt my approach to each dog. Whether your pup is energetic, shy, or somewhere in between, I use positive, balanced methods to help them feel secure and happy.',
  },
  {
    id: 'faq-special-needs',
    question: 'Can you care for special needs or senior dogs?',
    answer:
      'Absolutely! I have experience with dogs of all ages and abilities, including those needing medication, extra patience, or special routines. Every dog receives attentive, compassionate care—just like my own.',
  },
  {
    id: 'faq-unique',
    question: 'What makes your services unique?',
    answer:
      'Your dog becomes part of our family. With a deep love for animals, professional training, and a focus on individualized care, I ensure every dog enjoys a safe, structured, and loving environment—whether for a walk, a day, or an extended stay.',
  },
];

const DetailServices = () => {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('w-mod-js')) root.classList.add('w-mod-js');
    if (
      !root.classList.contains('w-mod-touch') &&
      ('ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch))
    ) {
      root.classList.add('w-mod-touch');
    }

    if (window.Webflow) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require && window.Webflow.require('ix2').init();
    }
  }, []);

  return (
    <>
      <NavBar />
      <DetailServicesHeroSection data={heroContent} />
      <CarePlansSection data={carePlans} />
      <ServicesFAQSection data={serviceFaqs} />
      <Footer />
    </>
  );
};

export default DetailServices;
