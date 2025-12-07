import React from "react";
import Image from "next/image";
import Link from "next/link";

const services = [
  {
    path: "/services/daily-strolls",
    title: "Daily strolls",
    description: "Tailored walks for your furry friend.",
    imageSrc: "/images/dogs/kaiser/kaiser1.jpeg",
    imageAlt: "Dog enjoying a neighborhood walk",
  },
  {
    path: "/services/group-adventures",
    title: "Group adventures",
    description: "Join friendly packs for social fun.",
    imageSrc: "/images/dogs/lakta/lakta2.jpg",
    imageAlt: "Group of dogs playing together outdoors",
  },
  {
    path: "/services/solo-journeys",
    title: "Solo journeys",
    description: "Dedicated care for your pet.",
    imageSrc: "/images/dogs/lakta/lakta1.jpg",
    imageAlt: "Dog sitting attentively on a trail",
  },
  {
    path: "/services/overnight-stays",
    title: "Overnight stays",
    description: "Safe and cozy nights.",
    imageSrc: "/images/dogs/Johnny/Johnny.jpeg",
    imageAlt: "Dog resting comfortably indoors",
    objectPosition: "center 35%",
  },
  {
    path: "/services/daytime-care",
    title: "Daytime care",
    description: "Engaging and secure day care.",
    imageSrc: "/images/dogs/aslan/aslan.jpg",
    imageAlt: "Dog being cared for during daytime playtime",
    objectPosition: "center 90%",
  },
  {
    path: "/services/home-check-ins",
    title: "Home check-ins",
    description: "Quick visits for your pet's needs.",
    imageSrc: "/images/dogs/Nola/nola2.jpg",
    imageAlt: "Person greeting a dog inside a home",
  },
  {
    path: "/services/training-help",
    title: "Training help",
    description: "Guidance for training essentials.",
    imageSrc: "/images/dogs/pancho/pancho2.jpeg",
    imageAlt: "Trainer working with a dog",
    objectPosition: "center 15%",
  },
  {
    path: "/services/custom-solutions",
    title: "Custom solutions",
    description: "Personalized care plans.",
    imageSrc: "/images/dogs/ollie/ollie1.jpeg",
    imageAlt: "Owner cuddling with a relaxed dog",
    objectPosition: "center 60%",
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
                  <div className="services-card_image">
                    <div style={{ transform: service.transform || "none" }}>
                      <div className="services-card_image">
                        <Image
                          src={service.imageSrc}
                          alt={service.imageAlt}
                          fill
                          sizes="(max-width: 991px) 100vw, 400px"
                          priority={service.title === "Daily strolls"}
                          className="services-image"
                          style={{
                            objectPosition: service.objectPosition || "center",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card_body text-overlay flex_vertical flex_child-expand">
                    <div className="heading_h4 eyebrow margin-bottom_none" style={{ marginTop: -20 }}>
                      {service.title}
                    </div>
                  </div>
                </div>
                <div className="button-group services-card_actions">
                  <p
                    className="paragraph_small text-color_secondary"
                    style={{ marginTop: 5 }}
                  >
                    {service.description}
                  </p>
                  <Link
                    href={service.path}
                    className="button services-card_button w-button"
                  >
                    <span>View {service.title.toLowerCase()}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Services;
