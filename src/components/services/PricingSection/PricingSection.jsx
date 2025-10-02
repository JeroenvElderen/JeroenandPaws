const plans = [
  {
    id: "walk-train",
    price: "$0",
    frequency: "Always free",
    title: "Walk & Train",
    description:
      "Perfect for daily walks and basic training. Flexible, friendly, and tailored to your dog’s needs.",
    cta: "Book now",
    features: [
      "30-min or custom walks",
      "Gentle, positive training",
      "Photo & update after each visit",
    ],
  },
  {
    id: "day-care",
    price: "$9",
    frequency: "Per walk",
    title: "Day Care",
    description:
      "A safe, playful space for your dog while you’re busy. Half or full days, always supervised and fun.",
    cta: "Reserve",
    features: [
      "Social play & enrichment",
      "Flexible drop-off & pick-up",
      "Personalized care routines",
      "Daily photo updates",
    ],
  },
  {
    id: "boarding",
    price: "$49",
    frequency: "Per night",
    title: "Boarding",
    description:
      "Overnight stays in a loving home. Your dog enjoys comfort, structure, and plenty of attention.",
    cta: "Request",
    features: [
      "24/7 supervision",
      "Daily walks & playtime",
      "Medication if needed",
      "Updates & photos",
      "Custom care requests",
    ],
  },
];

const CheckIcon = () => (
  <div className="icon is-xsmall is-background">
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19l12-12-1.41-1.41Z" fill="currentColor"></path>
    </svg>
  </div>
);

const PricingSection = () => (
  <section className="section is-secondary">
    <div className="container">
      <ul role="list" className="grid_3-col gap-small padding_none margin-bottom_none w-list-unstyled">
        {plans.map((plan) => (
          <li key={plan.id}>
            <div className="card on-secondary">
              <div className="card_body">
                <div className="margin-bottom_xsmall">
                  <div className="w-layout-hflex">
                    <h4 className="heading_h2 margin-bottom_none">{plan.price}</h4>
                  </div>
                  <p className="paragraph_small">{plan.frequency}</p>
                </div>
                <div className="divider is-secondary"></div>
                <div className="margin-top_xsmall margin_bottom-auto">
                  <h5 className="heading_h3">{plan.title}</h5>
                  <p>{plan.description}</p>
                </div>
                <div className="button-group margin-top_xsmall">
                  <a href="#" className="button w-inline-block">
                    <div>{plan.cta}</div>
                  </a>
                </div>
              </div>
            </div>
            <ul role="list" aria-label="Plan features" className="margin-bottom_none margin-top_small w-list-unstyled">
              <li className="flex_horizontal gap-xxsmall">
                <p className="eyebrow">Includes:</p>
              </li>
              {plan.features.map((feature) => (
                <li key={feature} className="flex_horizontal gap-xxsmall">
                  <CheckIcon />
                  <p>{feature}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default PricingSection;
