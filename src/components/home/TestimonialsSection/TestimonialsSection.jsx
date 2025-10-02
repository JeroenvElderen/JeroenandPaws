import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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

    const interval = setInterval(() => {
      setVisibleTestimonials((prev) => {
        const remaining = testimonials.filter(
          (testimonial) => !prev.some((item) => item.id === testimonial.id)
        );

        const nextSource = remaining.length > 0 ? remaining : testimonials;
        return pickRandomFour(nextSource);
      });
    }, 4000);

    return () => {
      abortController.abort();
      clearInterval(interval);
    };
  }, [testimonials.length]);

  const highlightedTestimonial = useMemo(() => {
    if (visibleTestimonials.length === 0) {
      return getRandomItem(FALLBACK_TESTIMONIALS);
    }

    return visibleTestimonials[getRandomIndex(visibleTestimonials.length)];
  }, [visibleTestimonials]);

  if (isLoading && visibleTestimonials.length === 0) {
    return <div className="section">Loading testimonials...</div>;
  }

  if (error && visibleTestimonials.length === 0) {
    return (
      <div className="section" style={{ color: "red" }}>
        Failed to load testimonials. Please try again later.
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div className="card">
            <div className="card_body">
              <div className="flex_vertical gap-small">
                <div className="avatar is-large">
                  <img
                    src={highlightedTestimonial?.avatar_url || "images/0e44b64c-d3fe-4e4d-897a-5b42d9786cef.avif"}
                    alt={highlightedTestimonial?.name || "Happy customer with pet"}
                    loading="lazy"
                    className="image_cover"
                  />
                </div>
                <div className="heading_h4 margin-bottom_none">
                  {highlightedTestimonial?.quote || FALLBACK_TESTIMONIALS[0].quote}
                </div>
                <div className="paragraph_small">
                  <strong>{highlightedTestimonial?.name || FALLBACK_TESTIMONIALS[0].name}</strong>
                </div>
                <div className="paragraph_small text-color_secondary">
                  {highlightedTestimonial?.role || FALLBACK_TESTIMONIALS[0].role}
                </div>
              </div>
            </div>
          </div>

          <div className="w-layout-grid grid_2-col mobile-l-1-col gap-small">
            {visibleTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="card">
                <div className="card_body_small">
                  <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                    <div className="avatar">
                      <img
                        src={testimonial.avatar_url}
                        alt={`Portrait of ${testimonial.name}`}
                        loading="lazy"
                        className="image_cover"
                      />
                    </div>
                    <div>
                      <div className="paragraph_small margin-bottom_none">
                        <strong>{testimonial.name}</strong>
                      </div>
                      <div className="paragraph_small">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="paragraph_small margin-bottom_none">{testimonial.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
