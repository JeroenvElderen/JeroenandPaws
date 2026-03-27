import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const AboutPage = () => (
  <main>
    <Head>
      <title>About Jeroen & Paws | Dog Care in Bray, Wicklow</title>
      <meta name="description" content="Meet Jeroen and learn about the calm, ethical dog care philosophy behind Jeroen & Paws." />
    </Head>

    <header className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div className="image-ratio_3x2">
            <Image src="/images/Jeroen.jpg" alt="Jeroen profile" width={900} height={600} className="image_cover" />
          </div>
          <div className="header">
            <h1 className="heading_h1">About Jeroen &amp; Paws</h1>
            <p className="paragraph_large">I provide calm, ethical dog care rooted in consistency, safety, and communication.</p>
            <div className="button-group">
              <Link href="/book" className="button w-button">Book a Meet &amp; Greet</Link>
              <Link href="/services" className="button is-secondary w-button">See services</Link>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
          <article className="card"><div className="card_body"><h2 className="heading_h5">My story</h2><p className="margin-bottom_none">Started locally helping owners with nervous and high-energy dogs, then built a structured full-time service.</p></div></article>
          <article className="card"><div className="card_body"><h2 className="heading_h5">Experience</h2><p className="margin-bottom_none">7+ years hands-on handling, pet first-aid aware, and force-free training principles.</p></div></article>
          <article className="card"><div className="card_body"><h2 className="heading_h5">Philosophy</h2><p className="margin-bottom_none">Low-stress routines, patient handling, and dependable communication for every family.</p></div></article>
        </div>
      </div>
    </section>
  </main>
);

export default AboutPage;
