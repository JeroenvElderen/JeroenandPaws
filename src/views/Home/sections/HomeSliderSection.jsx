import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  {
    title: "Daily walks, done right",
    description: "Personalised walks matched to your companion’s pace and routine.",
    href: "/services/daily-strolls",
    imageSrc: "/images/dogs/lola/lola1.jpeg",
    imageAlt: "Dog enjoying a neighborhood walk",
    translateY: "-10%",
  }, 
  {
    title: "Group adventures",
    description: "Fun, confidence-building outings where companions explore and play together.",
    href: "/services/group-adventures",
    imageSrc: "/images/dogs/lakta/lakta2.jpg",
    imageAlt: "Group of dogs playing together outdoors",
    translateY: "-10%",
  },
  {
    title: "Solo journeys",
    description: "One-to-one walks that provide calm, focused attention just for your companion.",
    href: "/services/solo-journeys",
    imageSrc: "/images/dogs/lakta/lakta1.jpg",
    imageAlt: "Dog sitting attentively on a trail",
  },
  {
    title: "Overnight stays",
    description: "A homely stay where your companion rests comfortably and feels safe.",
    href: "/services/overnight-stays",
    imageSrc: "/images/dogs/Johnny/Johnny.jpeg",
    imageAlt: "Dog resting comfortably indoors",
  },
  {
    title: "Daytime care",
    description: "Stimulating, reassuring days perfect for companions who love company.",
    href: "/services/daytime-care",
    imageSrc: "/images/dogs/aslan/aslan.jpg",
    imageAlt: "Dog being cared for during daytime playtime",
    translateY: "-15%",
  },
  {
    title: "Home check-ins",
    description: "Comforting drop-ins that keep your companion relaxed and well looked after.",
    href: "/services/home-check-ins",
    imageSrc: "/images/dogs/Nola/nola2.jpg",
    imageAlt: "Person greeting a dog inside a home",
    translateY: "-15%",
  },
  {
    title: "Training help",
    description: "Supportive guidance to build good habits and boost your companion’s confidence.",
    href: "/services/training-help",
    imageSrc: "/images/dogs/pancho/pancho2.jpeg",
    imageAlt: "Trainer working with a dog",
  },
  {
    title: "Custom solutions",
    description: "Tailored care shaped around your companion’s personality and lifestyle.",
    href: "/services/custom-solutions",
    imageSrc: "/images/dogs/ollie/ollie1.jpeg",
    imageAlt: "Owner cuddling with a relaxed dog",
    translateY: "-10%",
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
    <section data-copilot="true" className="section overflow_hidden" style={{ marginTop: -150}}>
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
                      <Image
                        width={405}
                        height={405}
                        alt={slide.imageAlt}
                        src={slide.imageSrc}
                        className="image_cover"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: `translateY(${slide.translateY || "0"})`,
                        }}
                        sizes="(min-width: 1024px) 405px, 80vw"
                        
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
