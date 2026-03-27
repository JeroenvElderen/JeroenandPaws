import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/marketing-site.module.css';

const ContactPage = () => (
  <main className={styles.page}>
    <Head>
      <title>Contact Jeroen & Paws | Dog Care in Bray, Wicklow</title>
      <meta name="description" content="Check availability and contact Jeroen & Paws for dog walking, daycare, and boarding in Bray and Wicklow." />
    </Head>

    <section className={`${styles.section} ${styles.hero}`}>
      <h1>Check Availability</h1>
      <p>Tell us what support you need and we&apos;ll reply quickly with availability.</p>
    </section>

    <section className={styles.section}>
      <form className={styles.form} action="mailto:jeroen@jeroenandpaws.com" method="post" encType="text/plain">
        <input type="text" name="name" placeholder="Your name" required />
        <input type="email" name="email" placeholder="Email" required />
        <select name="service" required>
          <option value="">Select a service</option>
          <option>Dog Walking</option>
          <option>Daycare</option>
          <option>Boarding</option>
        </select>
        <textarea name="notes" rows={5} placeholder="Tell us about your dog and needed days/times" required />
        <button className={styles.buttonPrimary} type="submit">Send Availability Request</button>
      </form>

      <div className={styles.ctaRow}>
        <Link href="/book" className={styles.buttonSecondary}>Go to booking page</Link>
      </div>
    </section>
  </main>
);

export default ContactPage;
