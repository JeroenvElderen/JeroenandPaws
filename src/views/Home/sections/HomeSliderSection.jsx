import React, { useEffect, useState } from 'react';

const SLIDES = [
  {
    title: 'Personalized Training',
    description:
      "Our training sessions are designed to meet your dog's unique needs, ensuring they learn in a way that's both effective and enjoyable.",
    cta: 'Learn more',
    imageSrc: '/images/2b4d97a3-883d-4557-abc5-8cf8f3f95400.avif',
    imageAlt: 'Animal training session for a welfare nonprofit',
  },
  {
    title: 'Daily Walks',
    description:
      'From short strolls to extended adventures, our walks are perfect for keeping your dog happy and healthy.',
    cta: 'Explore options',
    imageSrc: '/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif',
    imageAlt: 'Animal adoption event',
  },
  {
    title: 'Boarding Services',
    description: "A safe and loving environment for your dog while you're away, with all the comforts of home.",
    cta: 'Book now',
    imageSrc: '/images/25c0c9d1-2e99-484e-817b-bf1e3505d5e8.avif',
    imageAlt: 'Children playing in a daycare setting',
  },
  {
    title: 'Day Care',
    description:
      "Fun-filled days with plenty of play and socialization, ensuring your dog is well-cared for while you're at work.",
    cta: 'Join us',
    imageSrc: '/images/a58085e9-4555-461c-9f59-6029e44d0a55.avif',
    imageAlt: 'Pet training class',
  },
  {
    title: 'Drop-In Visits',
    description: 'Quick visits to check in on your pet, providing them with the attention and care they need.',
    cta: 'Schedule a visit',
    imageSrc: '/images/bc30b5db-c4fa-466a-a797-7ef1e270262b.avif',
    imageAlt: 'Chic pet lounging area',
  },
  {
    title: 'Specialized Care',
    description: 'Expert care for dogs with specific needs, ensuring they receive the best possible attention.',
    cta: 'Contact us',
    imageSrc: '/images/d801bc7b-4e2e-4836-8ed2-f4f819ecc79a.avif',
    imageAlt: 'Vet assisting an animal',
  },
];

const getVisibleSlides = (width) => {
  if (width < 768) return 1;
  if (width < 992) return 2;
  return 3;
};

const HomeSliderSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(() => {
    if (typeof window === 'undefined') return 3;
    return getVisibleSlides(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => setVisibleSlides(getVisibleSlides(window.innerWidth));

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? SLIDES.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
  };

  const translatePercentage = (100 / SLIDES.length) * currentIndex;
  const slideWidth = `${100 / visibleSlides}%`;

  return (
    <section data-copilot="true" className="section overflow_hidden">
      <div className="container">
        <div className="header is-align-center">
          <div className="eyebrow">Welcome to your dog&apos;s second home</div>
          <h2 className="heading_h2">Tailored care for every dog</h2>
        </div>
        <div className="slider overflow_visible w-slider home-slider">
          <div className="home-slider-mask w-slider-mask">
            <div className="home-slider-track" style={{ transform: `translateX(-${translatePercentage}%)` }}>
              {SLIDES.map(({ title, description, cta, imageSrc, imageAlt }) => (
                <article
                  key={title}
                  className="ix_card-deck-space height_100percent w-slide home-slider-slide"
                  style={{ width: slideWidth }}
                >
                  <div className="card overflow_hidden backdrop-filter_blur">
                    <div>
                      <div className="card_body padding-bottom_none">
                        <p className="heading_h4">{title}</p>
                        <p>{description}</p>
                        <p className="home-slider-cta">{cta}</p>
                      </div>
                      <div className="image-ratio_1x1 margin-top_xsmall margin-left_medium">
                        <img
                          width="405"
                          height="405"
                          alt={imageAlt}
                          src={imageSrc}
                          loading="lazy"
                          className="image_cover"
                        />
                      </div>
                    </div>
                  </div>
                  </article>
              ))}
            </div>
            </div>
          <button
            type="button"
            aria-label="Previous slide"
            className="slider_arrow is-previous is-bottom-center w-slider-arrow-left home-slider-arrow"
            onClick={handlePrevious}
          >
            <div className="w-icon-slider-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="slider_arrow is-next is-bottom-center w-slider-arrow-right home-slider-arrow"
            onClick={handleNext}
          >
            <div className="w-icon-slider-right" aria-hidden="true" />
          </button>
          <div className="display_none w-slider-nav w-slider-nav-invert w-round">Navigate</div>
        </div>
      </div>
    </section>
  );
};

export default HomeSliderSection;