import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/marketing-site.module.css';

const PricingPage = () => (
  <main className={styles.page}>
    <Head>
      <title>Dog Care Pricing in Bray, Wicklow | Jeroen & Paws</title>
      <meta name="description" content="Transparent pricing for dog walking, daycare, and boarding in Bray and Wicklow." />
    </Head>

    <section className={`${styles.section} ${styles.hero}`}>
      <h1>Pricing</h1>
      <p>Simple starting prices with clear inclusions.</p>
    </section>

    <section className={styles.section}>
      <table className={styles.priceTable}>
        <thead>
          <tr><th>Service</th><th>Starting price</th><th>What&apos;s included</th></tr>
        </thead>
        <tbody>
          <tr><td>Dog Walking</td><td>from €22</td><td>Pick-up/drop-off, structured walk, update</td></tr>
          <tr><td>Daycare</td><td>from €38</td><td>Supervised day care, enrichment, rest blocks</td></tr>
          <tr><td>Boarding</td><td>from €55</td><td>Overnight care, routine walks, photo updates</td></tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: '1.5rem' }}>Optional add-ons</h2>
      <ul>
        <li>Late pick-up / early drop-off</li>
        <li>Medication administration</li>
        <li>Extra solo walk during boarding/daycare</li>
      </ul>

      <div className={styles.ctaRow}>
        <Link href="/book" className={styles.buttonPrimary}>Book a Meet &amp; Greet</Link>
      </div>
    </section>
  </main>
);

export default PricingPage;
