import Link from 'next/link';

const StickyCta = () => (
  <div className="sticky-booking-cta" role="region" aria-label="Quick booking action">
    <Link href="/contact" className="sticky-booking-cta__button">
      Book a free consultation
    </Link>
  </div>
);

export default StickyCta;
