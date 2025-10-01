const CarePlansSection = ({ data = [] }) => {
  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Care Plans for Every Pup</h1>
        </div>
        <ul role="list" className="grid_4-col gap-xsmall text-align_center w-list-unstyled">
          {data.map((plan) => (
            <li key={plan.id} className="card on-secondary">
              <div className="card_body is-small">
                <div className="margin_bottom-auto">
                  <div className="eyebrow">{plan.title}</div>
                  <p className="heading_h3">{plan.price}</p>
                  <p>{plan.description}</p>
                </div>
                {plan.button_label && (
                  <div className="w-layout-hflex button-group is-align-center margin-bottom_xsmall">
                    <a href={plan.button_url} className="button w-button">
                      {plan.button_label}
                    </a>
                  </div>
                )}
                {plan.footnote && <p className="text-color_secondary">{plan.footnote}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CarePlansSection;
