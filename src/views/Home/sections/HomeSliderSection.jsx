import React, { useEffect, useState } from 'react';

const slides = [
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
    description:
      "A safe and loving environment for your dog while you're away, with all the comforts of home.",
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

const transitionDurationMs = 500;

const HomeSliderSection = () => {
  const loopOffset = slides.length;
  const [currentIndex, setCurrentIndex] = useState(loopOffset);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let resetTimeout;

    if (currentIndex >= loopOffset * 2 || currentIndex < loopOffset) {
      resetTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex((prev) => {
          if (prev >= loopOffset * 2) return prev - loopOffset;
          if (prev < loopOffset) return prev + loopOffset;
          return prev;
        });
      }, transitionDurationMs);
    }

    return () => {
      if (resetTimeout) clearTimeout(resetTimeout);
    };
  }, [currentIndex, loopOffset]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }
  }, [isTransitioning]);

  const goToSlide = (delta) => {
    setCurrentIndex((prev) => prev + delta);
  };

  const renderedSlides = [...slides, ...slides, ...slides];

  return (
    <section data-copilot="true" className="section overflow_hidden">
      <div className="container">
        <div className="header is-align-center">
          <div className="eyebrow">Welcome to your dog's second home</div>
          <h2 className="heading_h2">Tailored care for every dog</h2>
        </div>
        <div className="slider overflow_visible w-slider">
          <div
            className="width_35percent width_100percent_tablet overflow_visible w-slider-mask"
            style={{
              display: 'flex',
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: isTransitioning ? `transform ${transitionDurationMs}ms ease` : 'none',
            }}
          >
            {renderedSlides.map((slide, index) => (
              <div
                key={`${slide.title}-${index}`}
                className="ix_card-deck-space height_100percent w-slide"
                style={{ flex: '0 0 100%', maxWidth: '100%', display: 'flex' }}
              >
                <div className="card overflow_hidden backdrop-filter_blur" style={{ height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="card_body padding-bottom_none" style={{ flexGrow: 1 }}>
                      <p className="heading_h4">{slide.title}</p>
                      <p>{slide.description}</p>
                      <br />
                      <p>{slide.cta}</p>
                    </div>
                    <div className="image-ratio_1x1 margin-top_xsmall margin-left_medium">
                      <img
                        width="405"
                        height="405"
                        alt={slide.imageAlt}
                        src={slide.imageSrc}
                        loading="lazy"
                        className="image_cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="slider_arrow is-previous is-bottom-center w-slider-arrow-left"
            aria-label="Previous slide"
            onClick={() => goToSlide(-1)}
          >
            <div className="w-icon-slider-left" />
          </button>
          <button
            type="button"
            className="slider_arrow is-next is-bottom-center w-slider-arrow-right"
            aria-label="Next slide"
            onClick={() => goToSlide(1)}
          >
            <div className="w-icon-slider-right" />
          </button>
          <div className="display_none w-slider-nav w-slider-nav-invert w-round">Navigate</div>
        </div>
      </div>
    </section>
  );
};

export default HomeSliderSection;