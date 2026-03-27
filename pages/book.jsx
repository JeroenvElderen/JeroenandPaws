import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/marketing-site.module.css';

const calendlyUrl = 'https://calendly.com/';
const whatsappUrl = 'https://wa.me/353000000000';

const BookPage = () => (
  <main className={styles.page}>
    <Head>
      <title>Book a Meet & Greet | Jeroen & Paws Bray, Wicklow</title>
      <meta name="description" content="Book a meet & greet for dog walking, daycare, or boarding in Bray and Wicklow." />
    </Head>

    <section className={`${styles.section} ${styles.hero}`}>
      <h1>Book a Meet &amp; Greet</h1>
      <p>Pick the fastest option below. Mobile-friendly and takes under 2 minutes.</p>
      <div className={styles.ctaRow}>
        <a href={calendlyUrl} target="_blank" rel="noreferrer" className={styles.buttonPrimary}>Book via Calendly</a>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className={styles.buttonSecondary}>Book via WhatsApp</a>
      </div>
    </section>

    <section className={styles.section}>
      <h2>Prefer a quick form?</h2>
      <p>Use the contact form if you&apos;d like us to suggest suitable times for your meet &amp; greet.</p>
      <Link href="/contact" className={styles.buttonPrimary}>Open booking form</Link>
    </section>
  </main>
);

export default BookPage;
