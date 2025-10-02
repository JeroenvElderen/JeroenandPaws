const stats = [
  { value: "52K+", label: "Walks and training sessions" },
  { value: "2M+", label: "Tail wags and happy pups" },
];

const testimonials = [
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    role: "Dog parent, Amsterdam",
    quote:
      "Leaving my energetic husky with Jeroen & Paws was the best decision. I got daily updates, and my dog came home happy, calm, and better behaved than ever.",
    avatar:
      "https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/094b19ee-2c00-4f8f-8331-b47f1c1f2e8a.avif",
    alt: "headshot of customer with their pet",
  },
  {
    id: "taylor-kim",
    name: "Taylor Kim",
    role: "First-time puppy owner",
    quote:
      "The training tips and patient approach made a world of difference for my rescue pup. I felt supported every step of the way.",
    avatar:
      "https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/40704ce3-ed2d-49cf-a08e-e9d9342031d5.avif",
    alt: "headshot of a happy pet owner after training",
  },
  {
    id: "morgan-ellis",
    name: "Morgan Ellis",
    role: "Frequent traveler",
    quote:
      "I trust Jeroen & Paws for boarding whenever I travel. My dog is always excited to visit, and I know he’s in caring, expert hands every time.",
    avatar:
      "https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/297669ea-6a3b-4f6f-bc0e-37985d9dabf9.avif",
    alt: "headshot of customer with their pet",
  },
  {
    id: "jordan-blake",
    name: "Jordan Blake",
    role: "Busy professional",
    quote:
      "Flexible walks and drop-ins fit my schedule perfectly. My dog gets exercise and attention, and I get peace of mind.",
    avatar:
      "https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/9ab49776-8cef-4755-a926-aa095b3da0d3.avif",
    alt: "headshot of a customer interacting with their pet",
  },
];

const StoriesSection = () => (
  <section className="section">
    <div className="container">
      <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
        <div
          id="w-node-_0dc7589f-614c-e2cf-7555-5eed0be05d1f-0be05d1c"
          className="flex_horizontal flex_vertical is-space-between w-node-_634be294-27c0-98aa-065d-1bda5753a2e2-df7276e1"
        >
          <div className="header">
            <h2>What happy dogs (and humans) say</h2>
            <p className="subheading">
              Real stories from pet parents who trust us for training, walks, and care. See how our passion and expertise make a
              difference for every dog.
            </p>
          </div>
          <div className="w-layout-grid grid_2-col gap-small">
            {stats.map((stat) => (
              <div key={stat.value}>
                <div className="heading_h1">{stat.value}</div>
                <div>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-layout-grid grid_2-col mobile-l-1-col gap-small">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="card"
              id={testimonial.id === "alex-rivera" ? "w-node-d6288141-3e37-a760-1f1f-3f87c261e1bc-0be05d1c" : testimonial.id === "morgan-ellis" ? "w-node-_57b0b48d-fc7d-2a70-7d13-21713b2c2f03-0be05d1c" : undefined}
            >
              <div className="card_body_small">
                <div className="flex_horizontal is-y-center gap-xsmall margin-bottom_xsmall">
                  <div className="avatar">
                    <img
                      width="48"
                      height="48"
                      alt={testimonial.alt}
                      src={testimonial.avatar}
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

export default StoriesSection;
