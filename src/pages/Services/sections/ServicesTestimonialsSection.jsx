import React from 'react';

const FALLBACK_AVATAR =
  'https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/094b19ee-2c00-4f8f-8331-b47f1c1f2e8a.avif';

const FALLBACK_TESTIMONIALS = [
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    role: 'Dog parent, Amsterdam',
    quote:
      'Leaving my energetic husky with Jeroen & Paws was the best decision. I got daily updates, and my dog came home happy, calm, and better behaved than ever.',
    avatar_url:
      'https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/094b19ee-2c00-4f8f-8331-b47f1c1f2e8a.avif',
  },
  {
    id: 'taylor-kim',
    name: 'Taylor Kim',
    role: 'First-time puppy owner',
    quote:
      'The training tips and patient approach made a world of difference for my rescue pup. I felt supported every step of the way.',
    avatar_url:
      'https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/40704ce3-ed2d-49cf-a08e-e9d9342031d5.avif',
  },
  {
    id: 'morgan-ellis',
    name: 'Morgan Ellis',
    role: 'Frequent traveler',
    quote:
      'I trust Jeroen & Paws for boarding whenever I travel. My dog is always excited to visit, and I know he’s in caring, expert hands every time.',
    avatar_url:
      'https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/297669ea-6a3b-4f6f-bc0e-37985d9dabf9.avif',
  },
  {
    id: 'jordan-blake',
    name: 'Jordan Blake',
    role: 'Busy professional',
    quote:
      'Flexible walks and drop-ins fit my schedule perfectly. My dog gets exercise and attention, and I get peace of mind.',
    avatar_url:
      'https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/9ab49776-8cef-4755-a926-aa095b3da0d3.avif',
  },
];

const ServicesTestimonialsSection = ({ testimonials = [] }) => {
  const entries = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div className="flex_horizontal flex_vertical is-space-between">
            <div className="header">
              <h2>What happy dogs (and humans) say</h2>
              <p className="subheading">
                Real stories from pet parents who trust us for training, walks, and care. See how our passion and
                expertise make a difference for every dog.
              </p>
            </div>
            <div className="w-layout-grid grid_2-col gap-small">
              <div>
                <div className="heading_h1">52K+</div>
                <div>Walks and training sessions</div>
              </div>
              <div>
                <div className="heading_h1">2M+</div>
                <div>Tail wags and happy pups</div>
              </div>
            </div>
          </div>
          <div className="w-layout-grid grid_2-col mobile-l-1-col gap-small">
            {entries.map((testimonial) => (
              <div key={testimonial.id || testimonial.name} className="card">
                <div className="card_body_small">
                  <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                    <div className="avatar">
                      <img
                        height="48"
                        src={testimonial.avatar_url || FALLBACK_AVATAR}
                        alt={testimonial.name}
                        loading="lazy"
                        className="image_cover"
                      />
                    </div>
                    <div>
                      <div className="paragraph_small margin-bottom_none">
                        <strong>{testimonial.name}</strong>
                      </div>
                      {testimonial.role && <div className="paragraph_small">{testimonial.role}</div>}
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

export default ServicesTestimonialsSection;