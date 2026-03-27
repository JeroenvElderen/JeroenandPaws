import Head from 'next/head';
import Link from 'next/link';

const ServicePage = ({ title, metaTitle, metaDescription, intro, included, whoFor, details, priceFrom }) => (
  <main>
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
    </Head>

    <header className="section">
      <div className="container">
        <div className="header">
          <h1 className="heading_h1">{title}</h1>
          <p className="paragraph_large">{intro}</p>
          <div className="button-group">
            <Link href="/book" className="button w-button">Book a Meet &amp; Greet</Link>
          </div>
        </div>
      </div>
    </header>

    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
          <article className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card_body">
              <h2 className="heading_h3">What&apos;s included</h2>
              <ul>
                {included.map((item) => (<li key={item}>{item}</li>))}
              </ul>
            </div>
          </article>
          <article className="card">
            <div className="card_body">
              <h2 className="heading_h4">Pricing</h2>
              <p className="paragraph_large"><strong>From €{priceFrom}</strong></p>
              <Link href="/pricing" className="button is-secondary w-button">See pricing</Link>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-small">
          <article className="card"><div className="card_body"><h2 className="heading_h4">Who it&apos;s for</h2><p className="margin-bottom_none">{whoFor}</p></div></article>
          <article className="card">
            <div className="card_body">
              <h2 className="heading_h4">Key details</h2>
              <ul>
                {details.map((item) => (
                  <li key={item.label}><strong>{item.label}:</strong> {item.value}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
        <div className="button-group" style={{ marginTop: 24 }}>
          <Link href="/book" className="button w-button">Book a Meet &amp; Greet</Link>
        </div>
      </div>
    </section>
  </main>
);

export default ServicePage;
