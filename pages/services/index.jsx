import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/marketing-site.module.css';

const ServicesPage = () => (
  <main className={styles.page}>
    <Head>
      <title>Dog Services in Bray, Wicklow | Walking, Daycare, Boarding</title>
      <meta name="description" content="Explore dog walking, daycare, and boarding services in Bray and Wicklow. Transparent pricing and simple booking." />
    </Head>

    <section className={`${styles.section} ${styles.hero}`}>
      <h1>Dog Services in Bray, Wicklow</h1>
      <p>Choose the right level of care and book a meet &amp; greet in minutes.</p>
    </section>

    <section className={styles.section}>
      <div className={styles.grid3}>
        <article className={styles.card}><h2>Dog Walking</h2><p>Reliable individual or small-group walks.</p><Link href="/services/dog-walking" className={styles.buttonPrimary}>Dog Walking</Link></article>
        <article className={styles.card}><h2>Daycare</h2><p>Supervised daytime care with rest and play.</p><Link href="/services/daycare" className={styles.buttonPrimary}>Daycare</Link></article>
        <article className={styles.card}><h2>Boarding</h2><p>Overnight home-style boarding with updates.</p><Link href="/services/boarding" className={styles.buttonPrimary}>Boarding</Link></article>
      </div>
    </section>
  </main>
);

export default ServicesPage;
