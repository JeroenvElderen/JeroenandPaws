import Link from 'next/link';

const services = [
  { path: '/services/daily-strolls', label: 'Daily strolls' },
  { path: '/services/group-adventures', label: 'Group adventures' },
  { path: '/services/solo-journeys', label: 'Solo journeys' },
  { path: '/services/overnight-stays', label: 'Overnight & multi-day' },
  { path: '/services/daytime-care', label: 'Daytime care' },
  { path: '/services/home-check-ins', label: 'Home check-ins' },
  { path: '/services/training-help', label: 'Training help' },
  { path: '/services/custom-solutions', label: 'Custom solutions' },
];

const ServicesIndexPage = () => (
  <main className="section">
    <div className="container">
      <h1 className="heading_h2">Our services</h1>
      <p className="paragraph_large text-color_secondary">
        Choose a service to learn more and start your booking.
      </p>
      <div className="grid_2-col tablet-1-col gap-medium">
        {services.map((service) => (
          <Link key={service.path} href={service.path} className="card on-surface">
            <div className="flex_vertical gap-xsmall">
              <div className="heading_h5 margin-bottom_none">{service.label}</div>
              <div className="text-link">View details</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </main>
);

export default ServicesIndexPage;
