import ServicePage from '../../src/components/marketing/ServicePage';

const BoardingPage = () => (
  <ServicePage
    title="Dog Boarding in Bray, Wicklow"
    metaTitle="Dog Boarding in Bray, Wicklow | Jeroen & Paws"
    metaDescription="Trusted overnight dog boarding in Bray with a home environment, routine walks, and photo updates."
    intro="Safe overnight boarding in a home environment with daily routines and one-to-one attention."
    included={[
      'Overnight stay in home setting',
      'Walks and enrichment matched to temperament',
      'Medication support (if agreed)',
      'Daily photo/video updates',
    ]}
    whoFor="Dogs needing dependable overnight care while owners travel, with consistency and low stress."
    details={[
      { label: 'Duration', value: 'Per night' },
      { label: 'Group size', value: 'Limited boarding spots' },
      { label: 'Logistics', value: 'Meet & greet required before first stay' },
    ]}
    priceFrom="55"
  />
);

export default BoardingPage;
