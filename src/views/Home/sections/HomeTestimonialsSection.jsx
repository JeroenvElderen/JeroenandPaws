import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

const defaultTestimonials = [
  {
    name: 'Alex Johnson',
    role: 'Dog lover',
    quote:
      'The care and attention my dog received was exceptional. I felt at ease knowing he was in such capable hands.',
    avatar_url: '/images/0e44b64c-d3fe-4e4d-897a-5b42d9786cef.avif',
    avatar_alt: 'Headshot of a customer interacting with their pet',
  },
  {
    name: 'Taylor Smith',
    role: 'Pet parent',
    quote:
      'Our dog has never been happier! The training sessions were fun and effective.',
    avatar_url: '/images/55eb9a74-4563-4656-8285-693f3bc4b759.avif',
    avatar_alt: 'Headshot of a happy pet owner after training',
  },
  {
    name: 'Jordan Lee',
    role: 'Animal enthusiast',
    quote:
      'The boarding service was a lifesaver during our vacation. Our dog was well cared for and loved.',
    avatar_url: '/images/09861758-cd7a-47db-a18d-e8f951b34035.avif',
    avatar_alt: 'Headshot of a customer with their pet',
  },
  {
    name: 'Casey Brown',
    role: 'Dog owner',
    quote:
      'I highly recommend their services. The team is professional and truly cares about each pet.',
    avatar_url: '/images/f52d8d29-fbc0-41f0-b455-b872016a4be2.avif',
    avatar_alt: 'Headshot of a customer',
  },
];

const truncateQuote = (text, maxLength = 140) => {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
};

const HomeTestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let isActive = true;

    const loadTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials?limit=4');
        if (!response.ok) {
          throw new Error('Failed to load testimonials');
        }
        const payload = await response.json();
        if (isActive) {
          setTestimonials(Array.isArray(payload.testimonials) ? payload.testimonials : []);
        }
      } catch (error) {
        if (isActive) {
          setTestimonials([]);
        }
      }
    };

    loadTestimonials();

    return () => {
      isActive = false;
    };
  }, []);

  const displayTestimonials = useMemo(
    () => (testimonials.length ? testimonials : defaultTestimonials),
    [testimonials],
  );

  return (
    <section data-copilot="true" className="section">
        <div className="container">
          <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
            <div id="w-node-_0dc7589f-614c-e2cf-7555-5eed0be05d1f-0be05d1c" className="flex_horizontal flex_vertical is-space-between w-node-f5984468-b07a-271c-06a7-f4645ab0ffb7-055fd1ce">
              <div className="header">
                <h2>What our clients say</h2>
                <p className="subheading">Discover how our personalized dog care services have made a difference for pet owners like you. From training to boarding, our clients share their experiences.</p>
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
            <div className="w-layout-grid grid_2-col mobile-l-1-col gap-small">
              {displayTestimonials.map((testimonial, index) => {
                const avatarSrc = testimonial.avatar_url;
                const avatarAlt =
                  testimonial.avatar_alt ||
                  `Headshot of ${testimonial.name || 'a customer'}`;
                const isFeatured =
                  index === 0 || index === displayTestimonials.length - 1;
                return (
                  <div
                    key={testimonial.id || `${testimonial.name}-${index}`}
                    className={`card${isFeatured ? ' is-testimonial-featured' : ''}`}
                  >
                    <div className="card_body_small">
                      <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                        <div className="avatar">
                          {avatarSrc?.startsWith('/') ? (
                            <Image
                              width={64}
                              height={64}
                              alt={avatarAlt}
                              src={avatarSrc}
                              className="image_cover"
                            />
                          ) : (
                            avatarSrc && (
                              <img
                                width={64}
                                height={64}
                                alt={avatarAlt}
                                src={avatarSrc}
                                className="image_cover"
                                loading="lazy"
                              />
                            )
                          )}
                        </div>
                        <div>
                          <div className="paragraph_small margin-bottom_none">
                            <strong>{testimonial.name}</strong>
                          </div>
                          {testimonial.role && (
                            <div className="paragraph_small">{testimonial.role}</div>
                          )}
                        </div>
                      </div>
                      <p className="paragraph_small margin-bottom_none">
                        {truncateQuote(testimonial.quote)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
  );
};

export default HomeTestimonialsSection;