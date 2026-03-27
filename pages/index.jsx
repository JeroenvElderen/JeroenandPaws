import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/marketing-site.module.css';

const location = 'Bray, Wicklow';

const HomePage = () => (
  <main className={styles.page}>
    <Head>
      <title>Dog Care in Bray, Wicklow | Walking, Boarding & Daycare</title>
      <meta
        name="description"
        content="Trusted dog walking, daycare, and boarding in Bray and Wicklow. Book a meet & greet with Jeroen & Paws today."
      />
    </Head>

    <section className={`${styles.section} ${styles.hero}`}>
      <p className={styles.kicker}>Local dog care</p>
      <h1>Dog Care in {location} — Walking, Boarding &amp; Daycare</h1>
      <p>Calm, reliable care tailored to your dog&apos;s temperament and routine, so you can leave home stress-free.</p>
      <div className={styles.ctaRow}>
        <Link href="/book" className={styles.buttonPrimary}>Book a Meet &amp; Greet</Link>
        <Link href="/contact" className={styles.buttonSecondary}>Check Availability</Link>
      </div>
    </section>

    <section className={styles.section}>
      <p className={styles.kicker}>Social proof</p>
      <div className={styles.grid3}>
        <article className={styles.card}><strong>“Absolutely brilliant with nervous dogs.”</strong><p>— Local client, Bray</p></article>
        <article className={styles.card}><strong>7+ years of dog handling experience.</strong><p>Pet first-aid aware, calm handling approach.</p></article>
        <article className={styles.card}><strong>Real local dogs, real happy tails.</strong><p>See photo updates after walks and stays.</p></article>
      </div>
    </section>

    <section className={styles.section}>
      <p className={styles.kicker}>Services</p>
      <div className={styles.grid3}>
        <article className={styles.card}><h2>Dog Walking</h2><p>Structured solo or small-group walks with enrichment and report cards.</p><Link href="/services/dog-walking" className={styles.buttonPrimary}>View Dog Walking</Link></article>
        <article className={styles.card}><h2>Daycare</h2><p>Home-style day care for social dogs needing attention, rest, and routine.</p><Link href="/services/daycare" className={styles.buttonPrimary}>View Daycare</Link></article>
        <article className={styles.card}><h2>Boarding</h2><p>Overnight boarding with clear updates, comfort breaks, and one-to-one care.</p><Link href="/services/boarding" className={styles.buttonPrimary}>View Boarding</Link></article>
      </div>
    </section>

    <section className={styles.section}>
      <p className={styles.kicker}>About</p>
      <h2>Care led by trust, patience, and clear communication.</h2>
      <p>I&apos;m Jeroen. I started Jeroen &amp; Paws to provide ethical, low-stress care for local families who want dependable support.</p>
      <Link href="/about" className={styles.buttonSecondary}>Read my story</Link>
    </section>

    <section className={styles.section}>
      <p className={styles.kicker}>How it works</p>
      <ol className={styles.steps}>
        <li><strong>1. Book meet &amp; greet</strong> — We discuss your goals, dog routine, and any concerns.</li>
        <li><strong>2. Assessment</strong> — I assess temperament, social fit, and practical logistics.</li>
        <li><strong>3. Start service</strong> — We begin care with updates and predictable scheduling.</li>
      </ol>
    </section>

    <section className={styles.section}>
      <p className={styles.kicker}>Service area</p>
      <h2>Dog walking and pet care in Bray, Wicklow &amp; nearby neighborhoods.</h2>
      <p>Primary coverage includes Bray, Enniskerry, Shankill, Greystones, and nearby parts of North Wicklow.</p>
    </section>

    <section className={`${styles.section} ${styles.finalCta}`}>
      <h2>Ready to get started?</h2>
      <p>Book your meet &amp; greet and we&apos;ll plan care around your dog.</p>
      <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
        <Link href="/book" className={styles.buttonPrimary}>Book your meet &amp; greet</Link>
      </div>
    </section>
  </main>
);

export default HomePage;
