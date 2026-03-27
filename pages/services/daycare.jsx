import ServicePage from '../../src/components/marketing/ServicePage';

const DaycarePage = () => (
  <ServicePage
    title="Dog Daycare in Bray, Wicklow"
    metaTitle="Dog Daycare in Bray, Wicklow | Jeroen & Paws"
    metaDescription="Home-style dog daycare in Bray with supervised social time, enrichment, and rest periods."
    intro="A calm day care setting for social dogs who thrive with structure and company."
    included={[
      'Supervised social and rest blocks',
      'Toilet breaks and enrichment activities',
      'Midday walk (where suitable)',
      'End-of-day update for owners',
    ]}
    whoFor="Friendly dogs that should not be left alone all day and benefit from supervised routines."
    details={[
      { label: 'Duration', value: 'Half day or full day' },
      { label: 'Group size', value: 'Small supervised group' },
      { label: 'Logistics', value: 'Drop-off and pick-up windows available' },
    ]}
    priceFrom="38"
  />
);

export default DaycarePage;
