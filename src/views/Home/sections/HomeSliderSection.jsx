import Link from "next/link";
import React, { useEffect, useState } from "react";

const slides = [
  {
    title: "Daily walks, done right",
    description: "Personalised walks designed around your companion’s pace, energy, and daily routine.",
    href: "/services/daily-strolls",
    imageSrc: "/images/Bonnie.jpeg",
    imageAlt: "Dog enjoying a neighborhood walk",
  },
  {
    title: "Group adventures",
    description: "Confidence-building group outings where companions explore, play, and enjoy time together.",
    href: "/services/group-adventures",
    imageSrc: "/images/1a2eb736-6cd3-4d5b-9798-f040dc1d80b9.avif",
    imageAlt: "Group of dogs playing together outdoors",
  },
  {
    title: "Solo journeys",
    description: "Individual attention and peaceful one-to-one walks shaped around your companion’s needs.",
    href: "/services/solo-journeys",
    imageSrc: "/images/2269ca18-ac55-435f-bc79-d145bb23389b.avif",
    imageAlt: "Dog sitting attentively on a trail",
  },
  {
    title: "Overnight stays",
    description: "A calm, homely overnight experience where your companion rests comfortably and feels right at home.",
    href: "/services/overnight-stays",
    imageSrc: "/images/dogs/Johnny/Johnny.jpeg",
    imageAlt: "Dog resting comfortably indoors",
  },
  {
    title: "Daytime care",
    description: "A day filled with reassurance, stimulation, and fun — perfect for companions who thrive on company.",
    href: "/services/daytime-care",
    imageSrc: "/images/a58085e9-4555-461c-9f59-6029e44d0a55.avif",
    imageAlt: "Dog being cared for during daytime playtime",
  },
  {
    title: "Home check-ins",
    description: "Thoughtful drop-ins that ensure your companion is relaxed, supported, and well cared for while you’re away.",
    href: "/services/home-check-ins",
    imageSrc: "/images/bc30b5db-c4fa-466a-a797-7ef1e270262b.avif",
    imageAlt: "Person greeting a dog inside a home",
  },
  {
    title: "Training help",
    description: "Clear, encouraging training support to help your companion learn good habits with confidence.",
    href: "/services/training-help",
    imageSrc: "/images/2b4d97a3-883d-4557-abc5-8cf8f3f95400.avif",
    imageAlt: "Trainer working with a dog",
  },
  {
    title: "Custom solutions",
    description: "Bespoke care tailored to your companion’s personality, preferences, and lifestyle.",
    href: "/services/custom-solutions",
    imageSrc: "/images/d801bc7b-4e2e-4836-8ed2-f4f819ecc79a.avif",
    imageAlt: "Owner cuddling with a relaxed dog",
  },
];

const transitionDurationMs = 500;

const HomeSliderSection = () => {
  const loopOffset = slides.length;
  const [currentIndex, setCurrentIndex] = useState(loopOffset);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const slideSideMargin = isMobile ? 0 : 20;

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth <= 767);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const goToSlide = (delta) => {
    setCurrentIndex((prev) => prev + delta);
  };

  const renderedSlides = [...slides, ...slides, ...slides];

  return (
    <section data-copilot="true" className="section overflow_hidden">
      <div className="container">
        <div className="header is-align-center">
          <div className="eyebrow">Welcome to your companion’s second home</div>
          <h2 className="heading_h2">Personalised care for every companion</h2>
        </div>
        <div className="slider overflow_visible w-slider">
          <div
            className="slider_mask width_35percent width_100percent_tablet overflow_visible w-slider-mask"
            style={{
              display: "flex",
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: isTransitioning
                ? `transform ${transitionDurationMs}ms ease`
                : "none",
              ...(isMobile
                ? {
                    width: "100%",
                    maxWidth: "960px",
                    margin: "0 auto",
                    overflow: "hidden",
                    padding: "0 1rem",
                  }
                : {}),
            }}
          >
            {renderedSlides.map((slide, index) => (
              <div
                key={`${slide.title}-${index}`}
                className="ix_card-deck-space height_100percent w-slide"
                style={{
                  flex: "0 0 100%",
                  maxWidth: "100%",
                  display: "flex",
                  justifyContent: "center",
                  ...(isMobile ? { padding: 0 } : {}),
                }}
              >
                <div
                  className="card overflow_hidden backdrop-filter_blur"
                  style={{ height: "100%", width: isMobile ? "100%" : "auto" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      alignItems: isMobile ? "center" : "stretch",
                    }}
                  >
                    <div
                      className="card_body padding-bottom_none"
                      style={{ flexGrow: 1 }}
                    >
                      <p className="heading_h4">{slide.title}</p>
                      <p>{slide.description}</p>
                    </div>
                    <div
                      className="image-ratio_1x1 margin-top_xsmall"
                      style={{
                        marginRight: slideSideMargin,
                        marginLeft: slideSideMargin,
                      }}
                    >
                      <img
                        width="405"
                        height="405"
                        alt={slide.imageAlt}
                        src={slide.imageSrc}
                        loading="lazy"
                        className="image_cover"
                        style={{
                          width: "100%",
                          height: "405px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div
                      className="margin-top_small"
                      style={{
                        marginBottom: 20,
                        marginLeft: slideSideMargin,
                        marginRight: slideSideMargin,
                        width: "100%",
                        display: "flex",
                        justifyContent: isMobile ? "center" : "flex-start",
                      }}
                    >
                      <Link href={slide.href} className="button w-button">
                        View service
                      </Link>
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
          <div className="display_none w-slider-nav w-slider-nav-invert w-round">
            Navigate
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSliderSection;
