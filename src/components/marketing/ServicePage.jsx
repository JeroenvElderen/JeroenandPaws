import Head from 'next/head';
import Link from 'next/link';
import styles from '../../../styles/marketing-site.module.css';

const ServicePage = ({
  title,
  metaTitle,
  metaDescription,
  intro,
  included,
  whoFor,
  details,
  priceFrom,
}) => (
  <main className={styles.page}>
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
    </Head>

    <section className={`${styles.section} ${styles.hero}`}>
      <p className={styles.kicker}>Service</p>
      <h1>{title}</h1>
      <p>{intro}</p>
      <div className={styles.ctaRow}>
        <Link href="/book" className={styles.buttonPrimary}>Book a Meet &amp; Greet</Link>
      </div>
    </section>

    <section className={styles.section}>
      <h2>What&apos;s included</h2>
      <ul>
        {included.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>

    <section className={styles.section}>
      <h2>Who it&apos;s for</h2>
      <p>{whoFor}</p>
    </section>

    <section className={styles.section}>
      <h2>Key details</h2>
      <ul>
        {details.map((item) => <li key={item}><strong>{item.label}:</strong> {item.value}</li>)}
      </ul>
      <p><strong>Pricing:</strong> from €{priceFrom}</p>
      <div className={styles.ctaRow}>
        <Link href="/book" className={styles.buttonPrimary}>Book a Meet &amp; Greet</Link>
      </div>
    </section>
  </main>
);

export default ServicePage;
