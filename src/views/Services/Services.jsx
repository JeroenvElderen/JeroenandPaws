import React from "react";
import Image from "next/image";
import Link from "next/link";

const services = [
  {
    path: "/services/daily-strolls",
    title: "Daily strolls",
    description: "Personalised walks matched to your companion’s pace and routine.",
    imageSrc: "/images/dogs/lola/lola1.jpeg",
    imageAlt: "Dog enjoying a neighborhood walk",
    priceLabel: "From €18",
    tags: ["Solo Walks", "Routine Friendly", "Photo Updates"],
  },
  {
    path: "/services/home-check-ins",
    title: "Home check-ins",
    description:
      "Comforting drop-ins that keep your companion relaxed and well looked after.",
    imageSrc: "/images/dogs/Nola/nola2.jpg",
    imageAlt: "Person greeting a dog inside a home",
    priceLabel: "From €18",
    tags: ["Feeding", "Fresh Water", "Home Comfort"],
  },
  {
    path: "/services/training-help",
    title: "Training help",
    description:
      "Supportive guidance to build good habits and boost your companion’s confidence.",
    imageSrc: "/images/dogs/pancho/pancho2.jpeg",
    imageAlt: "Trainer working with a dog",
    priceLabel: "From €35",
    tags: ["Positive Methods", "Behaviour Goals", "Owner Support"],
  },
  {
    path: "/services/solo-journeys",
    title: "Solo journeys",
    description:
      "One-to-one walks that provide calm, focused attention just for your companion.",
    imageSrc: "/images/dogs/lakta/lakta1.jpg",
    imageAlt: "Dog sitting attentively on a trail",
    priceLabel: "From €70",
    tags: ["1-to-1 Care", "Confidence Building", "Calm Pace"],
  },
  {
    path: "/services/group-adventures",
    title: "Group adventures",
    description:
      "Fun, confidence-building outings where companions explore and play together.",
    imageSrc: "/images/dogs/lakta/lakta2.jpg",
    imageAlt: "Group of dogs playing together outdoors",
    priceLabel: "From €45",
    tags: ["Social Play", "Safe Packs", "Adventure Routes"],
  },
  {
    path: "/services/daytime-care",
    title: "Daytime care",
    description:
      "Stimulating, reassuring days perfect for companions who love company.",
    imageSrc: "/images/dogs/aslan/aslan.jpg",
    imageAlt: "Dog being cared for during daytime playtime",
    priceLabel: "From €25",
    tags: ["Playtime", "Rest Breaks", "Structured Day"],
  },
  {
    path: "/services/overnight-stays",
    title: "Overnight stays",
    description: "A homely stay where your companion rests comfortably and feels safe.",
    imageSrc: "/images/dogs/Johnny/Johnny.jpeg",
    imageAlt: "Dog resting comfortably indoors",
    priceLabel: "From €70/night",
    tags: ["Overnight Care", "Cosy Spaces", "24/7 Presence"],
  },
  {
    path: "/services/custom-solutions",
    title: "Custom solutions",
    description:
      "Tailored care shaped around your companion’s personality and lifestyle.",
    imageSrc: "/images/dogs/ollie/ollie1.jpeg",
    imageAlt: "Owner cuddling with a relaxed dog",
    priceLabel: "Custom",
    tags: ["Flexible Plan", "Built For You", "Mix & Match"],
  },
];

const Services = () => {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="header is-align-center">
            <div className="heading_h1">Our services</div>
            <h2 className="heading_h3">Pick the perfect fit</h2>
          </div>

          <div className="w-layout-grid grid_3-col tablet-1-col gap-small services-grid services-grid--showcase">
            {services.map((service) => (
              <article key={service.title} className="services-showcase-card">
                <div className="services-showcase-media">
                  <Image
                    src={service.imageSrc}
                    alt={service.imageAlt}
                    fill
                    sizes="(max-width: 991px) 100vw, 400px"
                    priority={service.title === "Daily strolls"}
                    className="image_cover"
                  />
                  <span className="services-showcase-price">{service.priceLabel}</span>
                </div>

                <div className="services-showcase-body">
                  <h3 className="heading_h4 margin-bottom_xsmall">{service.title}</h3>
                  <p className="paragraph_small text-color_secondary margin-bottom_small">
                    {service.description}
                  </p>

                  <div className="services-showcase-tags">
                    {service.tags.map((tag) => (
                      <span key={tag} className="services-showcase-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="services-showcase-footer">
                    <Link href={service.path} className="button services-card_button w-button">
                      <span>View service</span>
                      <span className="button_icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16" fill="none">
                          <path d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path>
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
