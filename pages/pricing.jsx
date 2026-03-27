import Head from 'next/head';
import Link from 'next/link';

const PricingPage = () => (
  <main>
    <Head>
      <title>Pricing | Dog Walking, Daycare & Boarding in Bray, Wicklow</title>
      <meta name="description" content="Transparent starting prices for dog walking, daycare, and boarding in Bray and Wicklow." />
    </Head>

    <header className="section">
      <div className="container">
        <div className="header">
          <h1 className="heading_h1">Pricing</h1>
          <p className="paragraph_large">Clear starting prices with no hidden surprises.</p>
        </div>
      </div>
    </header>

    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
          <article className="card"><div className="card_body"><h2 className="heading_h4">Walking</h2><p className="paragraph_large"><strong>from €22</strong></p><p>Pick-up/drop-off, structured walk, update.</p></div></article>
          <article className="card"><div className="card_body"><h2 className="heading_h4">Daycare</h2><p className="paragraph_large"><strong>from €38</strong></p><p>Supervised day care, enrichment, rest blocks.</p></div></article>
          <article className="card"><div className="card_body"><h2 className="heading_h4">Boarding</h2><p className="paragraph_large"><strong>from €55</strong></p><p>Overnight care, routine walks, photo updates.</p></div></article>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card_body">
            <h2 className="heading_h5">Optional add-ons</h2>
            <ul>
              <li>Late pick-up / early drop-off</li>
              <li>Medication administration</li>
              <li>Extra solo walk during daycare or boarding</li>
            </ul>
            <Link href="/book" className="button w-button">Book a Meet &amp; Greet</Link>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default PricingPage;
