import { CarePlanCard } from './CarePlanCard';

export function CarePlanList({ plans, title = 'Care plans' }) {
  if (!plans?.length) {
    return null;
  }

  return (
    <section className="section" id="care-plans">
      <div className="container">
        <div className="section-heading">
          <h2>{title}</h2>
          <p>Choose the right level of support for your family.</p>
        </div>
        <div className="care-plan-grid">
          {plans.map((plan) => (
            <CarePlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
