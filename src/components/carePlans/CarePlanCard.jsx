export function CarePlanCard({ plan }) {
  const { title, price, description, button_label: buttonLabel, button_url: buttonUrl, footnote } = plan;

  return (
    <article className="care-plan-card">
      <div className="care-plan-header">
        <h3>{title}</h3>
        {price && <p className="care-plan-price">{price}</p>}
      </div>
      {description && <p className="care-plan-description">{description}</p>}
      {buttonLabel && buttonUrl && (
        <a className="button button--primary" href={buttonUrl}>
          {buttonLabel}
        </a>
      )}
      {footnote && <p className="care-plan-footnote">{footnote}</p>}
    </article>
  );
}
