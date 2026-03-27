import ServicePage from '../../src/components/marketing/ServicePage';

const DogWalkingPage = () => (
  <ServicePage
    title="Dog Walking in Bray, Wicklow"
    metaTitle="Dog Walking in Bray, Wicklow | Jeroen & Paws"
    metaDescription="Structured and reliable dog walking in Bray, Wicklow with flexible durations and small groups."
    intro="Calm, dependable walks focused on exercise, sniffing time, and your dog's routine."
    included={[
      'Pick-up and drop-off in service area',
      'Structured walk matched to energy level',
      'Fresh water and wipe-down after walk',
      'Photo update and short summary',
    ]}
    whoFor="Dogs who need consistent exercise while you are working or away during the day."
    details={[
      { label: 'Duration', value: '30 or 60 minutes' },
      { label: 'Group size', value: 'Solo or max 3 compatible dogs' },
      { label: 'Logistics', value: 'Weekday walks with timed arrival windows' },
    ]}
    priceFrom="22"
  />
);

export default DogWalkingPage;
