"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    title: "Daily walks, done right",
    description:
      "Personalised walks matched to your companion’s pace and routine.",
    href: "/services/daily-strolls",
    imageSrc: "/images/dogs/lola/lola1.jpeg",
    imageAlt: "Dog enjoying a neighborhood walk",
    objectPosition: "50% 40%",
  },
  {
    title: "Group adventures",
    description:
      "Fun, confidence-building outings where companions explore and play together.",
    href: "/services/group-adventures",
    imageSrc: "/images/dogs/lakta/lakta2.jpg",
    imageAlt: "Group of dogs playing together outdoors",
  },
  {
    title: "Solo journeys",
    description:
      "One-to-one walks that provide calm, focused attention just for your companion.",
    href: "/services/solo-journeys",
    imageSrc: "/images/dogs/lakta/lakta1.jpg",
    imageAlt: "Dog sitting attentively on a trail",
    objectPosition: "50% 40%",
  },
  {
    title: "Overnight stays",
    description:
      "A homely stay where your companion rests comfortably and feels safe.",
    href: "/services/overnight-stays",
    imageSrc: "/images/dogs/Johnny/Johnny.jpeg",
    imageAlt: "Dog resting comfortably indoors",
    objectPosition: "50% 25%",
  },
  {
    title: "Daytime care",
    description:
      "Stimulating, reassuring days perfect for companions who love company.",
    href: "/services/daytime-care",
    imageSrc: "/images/dogs/aslan/aslan.jpg",
    imageAlt: "Dog being cared for during daytime playtime",
    objectPosition: "50% 90%",
  },
  {
    title: "Home check-ins",
    description:
      "Comforting drop-ins that keep your companion relaxed and well looked after.",
    href: "/services/home-check-ins",
    imageSrc: "/images/dogs/Nola/nola2.jpg",
    imageAlt: "Person greeting a dog inside a home",
    objectPosition: "50% 40%",
  },
  {
    title: "Training help",
    description:
      "Supportive guidance to build good habits and boost your companion’s confidence.",
    href: "/services/training-help",
    imageSrc: "/images/dogs/pancho/pancho2.jpeg",
    imageAlt: "Trainer working with a dog",
    objectPosition: "50% 25%",
  },
  {
    title: "Custom solutions",
    description:
      "Tailored care shaped around your companion’s personality and lifestyle.",
    href: "/services/custom-solutions",
    imageSrc: "/images/dogs/ollie/ollie1.jpeg",
    imageAlt: "Owner cuddling with a relaxed dog",
  },
];

function circularDelta(i, active, length) {
  let d = i - active;
  if (d > length / 2) d -= length;
  if (d < -length / 2) d += length;
  return d;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HomeSliderSection() {
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const prev = useCallback(
    () => setActive((a) => (a - 1 + slides.length) % slides.length),
    []
  );

  const next = useCallback(() => setActive((a) => (a + 1) % slides.length), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Autoplay (paused on hover, disabled for reduced motion)
  useEffect(() => {
    if (prefersReducedMotion() || isHovering) return;
    const id = setInterval(() => next(), 4500);
    return () => clearInterval(id);
  }, [isHovering, next]);

  // --- Swipe / drag support (touch + mouse) ---
  const swipeRef = useRef({
    startX: 0,
    startY: 0,
    active: false,
    pointerId: null,
    locked: null, // "h" | "v" | null
    fired: false,
  });

  const SWIPE_THRESHOLD = 40; // px before triggering prev/next
  const AXIS_LOCK_THRESHOLD = 10; // px before we decide intent

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    swipeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      active: true,
      pointerId: e.pointerId,
      locked: null,
      fired: false,
    };

    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      const s = swipeRef.current;
      if (!s.active || s.pointerId !== e.pointerId) return;

      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      // Lock axis once movement is meaningful
      if (!s.locked && (adx > AXIS_LOCK_THRESHOLD || ady > AXIS_LOCK_THRESHOLD)) {
        s.locked = adx > ady ? "h" : "v";
      }

      // If it’s horizontal intent, prevent the browser from treating it as scroll/gesture
      if (s.locked === "h") {
        e.preventDefault?.();

        if (!s.fired && adx >= SWIPE_THRESHOLD) {
          s.fired = true;

          // Swipe left -> next, swipe right -> prev
          if (dx < 0) next();
          else prev();
        }
      }
    },
    [next, prev]
  );

  const endSwipe = useCallback((e) => {
    const s = swipeRef.current;
    if (s.pointerId !== e.pointerId) return;

    swipeRef.current = {
      startX: 0,
      startY: 0,
      active: false,
      pointerId: null,
      locked: null,
      fired: false,
    };

    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, []);
  // --- end swipe support ---

  // Active ±2
  const visible = useMemo(() => {
    const items = [];
    for (let i = 0; i < slides.length; i++) {
      const d = circularDelta(i, active, slides.length);
      if (Math.abs(d) <= 2) items.push({ i, d, slide: slides[i] });
    }
    items.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    return items;
  }, [active]);

  return (
    <section
      data-copilot="true"
      className="section overflow_hidden"
      style={{ marginTop: -150 }}
    >
      <div className="container">
        <div className="header is-align-center">
          <div className="eyebrow">Welcome to your companion’s second home</div>
          <h2 className="heading_h2">Personalised care for every companion</h2>
        </div>

        <div
          className="cf"
          role="region"
          aria-roledescription="carousel"
          aria-label="Services"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endSwipe}
          onPointerCancel={endSwipe}
        >
          <div className="stage">
            {visible.map(({ i, d, slide }) => {
              const abs = Math.abs(d);
              const side = Math.sign(d);
              const isActive = d === 0;

              const x = side * (abs === 1 ? 1 : 2);
              const z = abs === 0 ? 0 : abs === 1 ? -140 : -260;
              const scale = abs === 0 ? 1 : abs === 1 ? 0.9 : 0.8;
              const rotateY = abs === 0 ? 0 : side * (abs === 1 ? 10 : 16);
              const opacity = abs === 0 ? 1 : abs === 1 ? 0.55 : 0.28;
              const blur = abs === 0 ? 0 : abs === 1 ? 1.25 : 2.5;

              const zIndex = 100 - abs * 10 + (isActive ? 20 : 0);

              return (
                <article
                  key={slide.href}
                  className={`cardWrap ${isActive ? "isActive" : ""}`}
                  style={{
                    zIndex,
                    opacity,
                    filter: `blur(${blur}px)`,
                    transform: `
                      translate3d(calc(${x} * var(--cf-spread)), ${
                      abs ? "10px" : "0px"
                    }, ${z}px)
                      rotateY(${rotateY}deg)
                      scale(${scale})
                    `,
                  }}
                >
                  <button
                    type="button"
                    className="cardHit"
                    onClick={() => setActive(i)}
                    aria-label={isActive ? "Current slide" : `Show ${slide.title}`}
                    tabIndex={isActive ? 0 : -1}
                  >
                    <div className="card">
                      <Image
                        src={slide.imageSrc}
                        alt={slide.imageAlt}
                        fill
                        priority={isActive}
                        className="bg"
                        sizes="(max-width: 767px) 92vw, (min-width: 768px) 720px"
                        style={{
                          objectFit: "cover",
                          objectPosition: slide.objectPosition || "50% 50%",
                          transform: isActive ? "scale(1.02)" : "scale(1.01)",
                        }}
                      />

                      <div className="scrim" aria-hidden="true" />

                      <div className="content">
                        <h3 className="title">{slide.title}</h3>
                        <p className="desc">{slide.description}</p>

                        <div className="cta">
                          <Link
                            href={slide.href}
                            className="button w-button"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View service
                          </Link>
                        </div>
                      </div>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>

          <div className="controls">
            <button
              type="button"
              className="arrow"
              onClick={prev}
              aria-label="Previous slide"
            >
              ‹
            </button>

            <div className="count" aria-live="polite">
              {active + 1} / {slides.length}
            </div>

            <button
              type="button"
              className="arrow"
              onClick={next}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </div>

        <style jsx>{`
          .cf {
            margin-top: -2.5rem;
            --cf-spread: 130px;
            touch-action: pan-y; /* allow vertical scroll, enable horizontal swipe intent */
            user-select: none;
            -webkit-user-select: none;
          }

          .stage {
            position: relative;
            height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
            perspective: 1000px;
            transform-style: preserve-3d;
            overflow: visible;
          }

          .cardWrap {
            position: absolute;
            width: min(92vw, 560px);
            aspect-ratio: 16 / 10;
            transform-style: preserve-3d;
            transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 380ms ease, filter 380ms ease;
            pointer-events: none;
          }

          .cardWrap.isActive {
            pointer-events: auto;
          }

          .cardHit {
            all: unset;
            display: block;
            width: 100%;
            height: 100%;
            cursor: pointer;
          }

          .card {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 26px 70px rgba(0, 0, 0, 0.45);
          }

          :global(.bg) {
            object-fit: cover;
            object-position: center;
          }

          .scrim {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.7) 0%,
              rgba(0, 0, 0, 0.4) 36%,
              rgba(0, 0, 0, 0.12) 68%
            );
          }

          .content {
            position: absolute;
            inset: 0;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            color: #fff;
          }

          .title {
            font-size: 1.35rem;
            line-height: 1.15;
            letter-spacing: -0.02em;
            margin: 0;
          }

          .desc {
            margin: 0.6rem 0 0;
            opacity: 0.95;
            max-width: 40ch;
            font-size: 0.95rem;
          }

          .cta {
            margin-top: 1rem;
          }

          .controls {
            margin-top: -1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
          }

          .arrow {
            width: 44px;
            height: 44px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.08);
            color: inherit;
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
            box-shadow: 0 10px 22px rgba(0, 0, 0, 0.14);
            transition: transform 160ms ease, background 160ms ease;
          }

          .arrow:hover {
            transform: translateY(-1px);
            background: rgba(255, 255, 255, 0.14);
          }

          .count {
            min-width: 90px;
            text-align: center;
            opacity: 0.85;
            font-weight: 600;
          }

          @media (min-width: 768px) {
            .cf {
              --cf-spread: 220px;
            }

            .stage {
              height: 520px;
              perspective: 1200px;
            }

            .cardWrap {
              width: min(84vw, 720px);
              aspect-ratio: 16 / 9;
            }

            .content {
              padding: 1.75rem;
            }

            .title {
              font-size: 1.9rem;
            }

            .desc {
              font-size: 1rem;
            }
          }

          @media (min-width: 1024px) {
            .cf {
              --cf-spread: 300px;
            }

            .stage {
              height: 560px;
              perspective: 1400px;
            }

            .content {
              padding: 2rem;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
