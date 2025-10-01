import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const FALLBACK_TESTIMONIALS = [
  {
    id: "alex-johnson",
    name: "Alex Johnson",
    role: "Dog lover",
    quote:
      "The care and attention my dog received was exceptional. I felt at ease knowing he was in such capable hands.",
    avatar_url: "images/0e44b64c-d3fe-4e4d-897a-5b42d9786cef.avif",
  },
  {
    id: "taylor-smith",
    name: "Taylor Smith",
    role: "Pet parent",
    quote:
      "Our dog has never been happier! The training sessions were fun and effective.",
    avatar_url: "images/55eb9a74-4563-4656-8285-693f3bc4b759.avif",
  },
  {
    id: "jordan-lee",
    name: "Jordan Lee",
    role: "Animal enthusiast",
    quote:
      "The boarding service was a lifesaver during our vacation. Our dog was well cared for and loved.",
    avatar_url: "images/09861758-cd7a-47db-a18d-e8f951b34035.avif",
  },
  {
    id: "casey-brown",
    name: "Casey Brown",
    role: "Dog owner",
    quote:
      "I highly recommend their services. The team is professional and truly cares about each pet.",
    avatar_url: "images/f52d8d29-fbc0-41f0-b455-b872016a4be2.avif",
  },
];

const pickRandomFour = (arr) => {
  if (arr.length <= 4) return arr;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

const getRandomIndex = (length) => Math.floor(Math.random() * length);
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleTestimonials, setVisibleTestimonials] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadTestimonials = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from("testimonials")
          .select("*")
          .order("display_order", { ascending: true });

        if (supabaseError) throw supabaseError;

        const source =
          Array.isArray(data) && data.length > 0 ? data : FALLBACK_TESTIMONIALS;

        setTestimonials(source);
        setVisibleTestimonials(pickRandomFour(source));
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load testimonials from Supabase:", err);
        setError(err);
        setVisibleTestimonials(pickRandomFour(FALLBACK_TESTIMONIALS));
      } finally {
        setIsLoading(false);
      }
    };

    loadTestimonials();

    return () => abortController.abort();
  }, []);

  const testimonialsToRender = useMemo(() => {
    return testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
  }, [testimonials]);

  // Replace one random card every 5 seconds
  useEffect(() => {
    if (testimonialsToRender.length <= 4) return;

    const interval = setInterval(() => {
      setVisibleTestimonials((prev) => {
        if (prev.length === 0) return pickRandomFour(testimonialsToRender);

        const newCards = [...prev];
        const replaceIndex = getRandomIndex(prev.length);

        let newCard = getRandomItem(testimonialsToRender);
        const currentIds = prev.map((p) => p.id);
        let attempts = 0;

        while (
          currentIds.includes(newCard.id) &&
          attempts < testimonialsToRender.length
        ) {
          newCard = getRandomItem(testimonialsToRender);
          attempts++;
        }

        newCards[replaceIndex] = newCard;
        return newCards;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonialsToRender]);

  return (
    <section data-copilot="true" className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          {/* Left info */}
          <div
            id="w-node-_0dc7589f-614c-e2cf-7555-5eed0be05d1f-0be05d1c"
            className="flex_horizontal flex_vertical is-space-between w-node-f5984468-b07a-271c-06a7-f4645ab0ffb7-055fd1ce"
          >
            <div className="header">
              <h2>What our clients say</h2>
              <p className="subheading">
                Discover how our personalized dog care services have made a
                difference for pet owners like you. From training to boarding,
                our clients share their experiences.
              </p>
              {error && (
                <p className="paragraph_small margin-bottom_none" role="status">
                  We&apos;re showing our featured testimonials while we refresh
                  the latest reviews.
                </p>
              )}
            </div>
            <div className="w-layout-grid grid_2-col gap-small">
              <div>
                <div className="heading_h1">52K+</div>
                <div>Satisfied pet owners</div>
              </div>
              <div>
                <div className="heading_h1">2M+</div>
                <div>Walks and visits</div>
              </div>
            </div>
          </div>

          {/* Testimonials grid (4 cards) */}
          <div className="w-layout-grid grid_2-col mobile-l-1-col gap-small">
            {isLoading ? (
              <div className="card">
                <div className="card_body_small">
                  <p
                    className="paragraph_small margin-bottom_none"
                    role="status"
                  >
                    Loading testimonials...
                  </p>
                </div>
              </div>
            ) : (
              visibleTestimonials.map((testimonial) => {
                const {
                  id,
                  name,
                  role,
                  quote,
                  avatar_url: avatarUrl,
                } = testimonial;
                const displayName = name || "Happy client";
                const displayRole = role || "Pet parent";
                const displayQuote =
                  quote ||
                  "We love caring for our clients and their pups, and it shows in every visit.";

                return (
                  <div
                    key={id ?? `${displayName}-${displayRole}`}
                    className="card"
                  >
                    <div className="card_body_small">
                      <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                        <div className="avatar">
                          <img
                            width="64"
                            height="64"
                            alt={`${displayName} headshot`}
                            src={
                              avatarUrl ||
                              "images/0e44b64c-d3fe-4e4d-897a-5b42d9786cef.avif"
                            }
                            loading="lazy"
                            className="image_cover"
                          />
                        </div>
                        <div>
                          <div className="paragraph_small margin-bottom_none">
                            <strong>{displayName}</strong>
                          </div>
                          <div className="paragraph_small">{displayRole}</div>
                        </div>
                      </div>
                      <p className="paragraph_small margin-bottom_none">
                        {displayQuote}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
