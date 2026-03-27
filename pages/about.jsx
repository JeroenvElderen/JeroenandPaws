import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/marketing-site.module.css';

const AboutPage = () => (
  <main className={styles.page}>
    <Head>
      <title>About Jeroen & Paws | Dog Care in Bray, Wicklow</title>
      <meta name="description" content="Meet Jeroen and learn about the calm, ethical care philosophy behind Jeroen & Paws in Bray, Wicklow." />
    </Head>

    <section className={`${styles.section} ${styles.hero}`}>
      <h1>About Jeroen &amp; Paws</h1>
      <p>I built Jeroen &amp; Paws to offer practical, trustworthy support for local dog owners who want care done properly.</p>
    </section>

    <section className={styles.section}>
      <h2>My story</h2>
      <p>After years helping friends and neighbors with reactive and high-energy dogs, I turned that experience into a local service focused on calm routines and clear communication.</p>
      <h2>Experience &amp; credentials</h2>
      <ul>
        <li>7+ years hands-on dog handling experience</li>
        <li>Pet first-aid aware practices</li>
        <li>Continuous study in force-free, ethical dog care</li>
      </ul>
      <h2>Philosophy</h2>
      <p>Dogs do best with consistency, patient boundaries, and low-stress environments. That drives every walk, daycare day, and boarding stay.</p>
      <p><strong>Real photo:</strong> Please replace this section with your preferred personal image asset for strongest trust conversion.</p>
      <Link href="/book" className={styles.buttonPrimary}>Book a Meet &amp; Greet</Link>
    </section>
  </main>
);

export default AboutPage;
