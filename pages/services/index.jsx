import Head from 'next/head';
import Link from 'next/link';

const ServicesPage = () => (
  <main>
    <Head>
      <title>Dog Services in Bray, Wicklow | Jeroen & Paws</title>
      <meta name="description" content="Explore dog walking, daycare, and boarding in Bray and Wicklow and book a meet & greet." />
    </Head>

    <header className="section">
      <div className="container">
        <div className="header">
          <h1 className="heading_h1">Dog Services in Bray, Wicklow</h1>
          <p className="paragraph_large">Choose the right care option and book your meet &amp; greet in minutes.</p>
        </div>
      </div>
    </header>

    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
          <article className="card"><div className="card_body"><h2 className="heading_h4">Dog Walking</h2><p>Reliable solo or small-group walks.</p><Link href="/services/dog-walking" className="button w-button">View service</Link></div></article>
          <article className="card"><div className="card_body"><h2 className="heading_h4">Daycare</h2><p>Supervised day care with routine and rest.</p><Link href="/services/daycare" className="button w-button">View service</Link></div></article>
          <article className="card"><div className="card_body"><h2 className="heading_h4">Boarding</h2><p>Overnight home-style boarding with updates.</p><Link href="/services/boarding" className="button w-button">View service</Link></div></article>
        </div>
      </div>
    </section>
  </main>
);

export default ServicesPage;
