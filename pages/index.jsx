import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const HomePage = () => (
  <main>
    <Head>
      <title>Dog Care in Bray, Wicklow — Walking, Boarding & Daycare | Jeroen & Paws</title>
      <meta
        name="description"
        content="Dog walking, daycare and boarding in Bray and Wicklow. Book a meet & greet and get calm, reliable care tailored to your dog."
      />
    </Head>

    <header className="section">
      <div className="container">
        <div className="header">
          <h1 className="heading_h1">Dog Care in Bray, Wicklow — Walking, Boarding &amp; Daycare</h1>
          <p className="paragraph_large">Calm, reliable care tailored to your dog’s temperament and routine so you can leave home stress-free.</p>
          <div className="button-group">
            <Link href="/book" className="button w-button">Book a Meet &amp; Greet</Link>
            <Link href="/contact" className="button is-secondary w-button">Check Availability</Link>
          </div>
        </div>
      </div>
    </header>

    <section className="section">
      <div className="container">
        <div className="header"><h2 className="heading_h2">Trusted by local dog owners</h2></div>
        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
          <article className="card"><div className="card_body"><p><strong>“Absolutely brilliant with nervous dogs.”</strong></p><p className="paragraph_small margin-bottom_none">— Client in Bray</p></div></article>
          <article className="card"><div className="card_body"><p><strong>7+ years of hands-on experience.</strong></p><p className="paragraph_small margin-bottom_none">Calm handling and ethical care methods.</p></div></article>
          <article className="card"><div className="card_body"><p><strong>Real photos and updates.</strong></p><p className="paragraph_small margin-bottom_none">You’ll see how your dog is doing after each service.</p></div></article>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="header"><h2 className="heading_h2">Services</h2></div>
        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
          <article className="card"><div className="card_body"><h3 className="heading_h4">Dog Walking</h3><p>Structured solo or small-group walks.</p><Link href="/services/dog-walking" className="button w-button">Dog Walking</Link></div></article>
          <article className="card"><div className="card_body"><h3 className="heading_h4">Daycare</h3><p>Supervised daytime care with routine, play and rest.</p><Link href="/services/daycare" className="button w-button">Daycare</Link></div></article>
          <article className="card"><div className="card_body"><h3 className="heading_h4">Boarding</h3><p>Comfortable overnight care with regular updates.</p><Link href="/services/boarding" className="button w-button">Boarding</Link></div></article>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div className="image-ratio_3x2">
            <Image src="/images/Jeroen.jpg" alt="Jeroen with a dog" width={900} height={600} className="image_cover" />
          </div>
          <div>
            <h2 className="heading_h2">About Jeroen</h2>
            <p>I built Jeroen &amp; Paws to provide calm, ethical dog care with clear communication and dependable routines.</p>
            <Link href="/about" className="button is-secondary w-button">Read more</Link>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="header"><h2 className="heading_h2">How it works</h2></div>
        <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
          <article className="card"><div className="card_body"><h3 className="heading_h5">1. Book meet &amp; greet</h3><p className="margin-bottom_none">Tell me about your dog and goals.</p></div></article>
          <article className="card"><div className="card_body"><h3 className="heading_h5">2. Assessment</h3><p className="margin-bottom_none">We assess temperament, social fit and logistics.</p></div></article>
          <article className="card"><div className="card_body"><h3 className="heading_h5">3. Start service</h3><p className="margin-bottom_none">Begin care with updates and predictable scheduling.</p></div></article>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <h2 className="heading_h2">Service area</h2>
        <p>Dog walking, daycare and boarding in Bray, Enniskerry, Shankill, Greystones and surrounding Wicklow areas.</p>
        <div className="button-group">
          <Link href="/book" className="button w-button">Book your meet &amp; greet</Link>
        </div>
      </div>
    </section>
  </main>
);

export default HomePage;
