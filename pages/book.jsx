import Head from 'next/head';
import Link from 'next/link';

const calendlyUrl = 'https://calendly.com/';
const whatsappUrl = 'https://wa.me/353000000000';

const BookPage = () => (
  <main>
    <Head>
      <title>Book a Meet & Greet | Jeroen & Paws Bray, Wicklow</title>
      <meta name="description" content="Book your meet & greet for dog walking, daycare, or boarding in Bray and Wicklow." />
    </Head>

    <header className="section">
      <div className="container">
        <div className="header">
          <h1 className="heading_h1">Book a Meet &amp; Greet</h1>
          <p className="paragraph_large">Fast booking options below — mobile-friendly and simple.</p>
          <div className="button-group">
            <a href={calendlyUrl} target="_blank" rel="noreferrer" className="button w-button">Book via Calendly</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="button is-secondary w-button">Book via WhatsApp</a>
          </div>
          <p className="paragraph_small">Prefer a form? <Link href="/contact">Use the contact page</Link>.</p>
        </div>
      </div>
    </header>
  </main>
);

export default BookPage;
