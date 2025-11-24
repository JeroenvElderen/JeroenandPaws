import React from "react";
import Link from "next/link";

const services = [
  {
    path: "/services/daily-strolls",
    title: "Daily strolls",
    description: "Tailored walks for your furry friend.",
    imageSrc: "/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif",
    imageAlt: "Dog enjoying a neighborhood walk",
  },
  {
    path: "/services/group-adventures",
    title: "Group adventures",
    description: "Join friendly packs for social fun.",
    imageSrc: "/images/1a2eb736-6cd3-4d5b-9798-f040dc1d80b9.avif",
    imageAlt: "Group of dogs playing together outdoors",
  },
  {
    path: "/services/solo-journeys",
    title: "Solo journeys",
    description: "Dedicated care for your pet.",
    imageSrc: "/images/2269ca18-ac55-435f-bc79-d145bb23389b.avif",
    imageAlt: "Dog sitting attentively on a trail",
  },
  {
    path: "/services/overnight-stays",
    title: "Overnight stays",
    description: "Safe and cozy nights.",
    imageSrc: "/images/25c0c9d1-2e99-484e-817b-bf1e3505d5e8.avif",
    imageAlt: "Dog resting comfortably indoors",
  },
  {
    path: "/services/daytime-care",
    title: "Daytime care",
    description: "Engaging and secure day care.",
    imageSrc: "/images/a58085e9-4555-461c-9f59-6029e44d0a55.avif",
    imageAlt: "Dog being cared for during daytime playtime",
  },
  {
    path: "/services/home-check-ins",
    title: "Home check-ins",
    description: "Quick visits for your pet's needs.",
    imageSrc: "/images/bc30b5db-c4fa-466a-a797-7ef1e270262b.avif",
    imageAlt: "Person greeting a dog inside a home",
  },
  {
    path: "/services/training-help",
    title: "Training help",
    description: "Guidance for training essentials.",
    imageSrc: "/images/2b4d97a3-883d-4557-abc5-8cf8f3f95400.avif",
    imageAlt: "Trainer working with a dog",
  },
  {
    path: "/services/custom-solutions",
    title: "Custom solutions",
    description: "Personalized care plans.",
    imageSrc: "/images/d801bc7b-4e2e-4836-8ed2-f4f819ecc79a.avif",
    imageAlt: "Owner cuddling with a relaxed dog",
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
            <p className="subheading max-width_large">
              Choose from trusted walks, engaging adventures, supportive
              training, and cozy stays. Every option is delivered with the same
              friendly, professional care.
            </p>
          </div>

          <div className="w-layout-grid grid_3-col tablet-1-col gap-small services-grid">
            {services.map((service) => (
              <div
                key={service.title}
                className="card height_100percent services-card"
              >
                <div className="card-link flex_vertical gap-small height_100percent">
                  <div className="image-ratio_4x3 services-card_image">
                    <img
                      src={service.imageSrc}
                      alt={service.imageAlt}
                      className="image_cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="card_body flex_vertical gap-xsmall flex_child-expand">
                    <div className="eyebrow">Service</div>
                    <div className="heading_h4 margin-bottom_none">
                      {service.title}
                    </div>
                    <p className="paragraph_small text-color_secondary margin-bottom_none">
                      {service.description}
                    </p>
                  </div>
                </div>
                <Link
                  href={service.path}
                  className="button services-card_button w-button"
                >
                  <span>Book {service.title.toLowerCase()}</span>
                  <span className="button_icon" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="100%"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
