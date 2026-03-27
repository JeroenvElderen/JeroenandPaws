import Head from 'next/head';
import Link from 'next/link';

const ContactPage = () => (
  <main>
    <Head>
      <title>Contact | Dog Care in Bray, Wicklow</title>
      <meta name="description" content="Check availability for dog walking, daycare, and boarding in Bray and Wicklow." />
    </Head>

    <header className="section">
      <div className="container">
        <div className="header">
          <h1 className="heading_h1">Check Availability</h1>
          <p className="paragraph_large">Tell me what support you need and I’ll come back with available meet &amp; greet slots.</p>
        </div>
      </div>
    </header>

    <section className="section">
      <div className="container">
        <form className="card" action="mailto:jeroen@jeroenandpaws.com" method="post" encType="text/plain">
          <div className="card_body">
            <div className="form_grid">
              <label>Name<input type="text" name="name" required /></label>
              <label>Email<input type="email" name="email" required /></label>
              <label>Service
                <select name="service" required>
                  <option value="">Select service</option>
                  <option>Dog Walking</option>
                  <option>Daycare</option>
                  <option>Boarding</option>
                </select>
              </label>
              <label>Details<textarea name="notes" rows={5} required /></label>
            </div>
            <div className="button-group">
              <button type="submit" className="button w-button">Send Availability Request</button>
              <Link href="/book" className="button is-secondary w-button">Book directly</Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  </main>
);

export default ContactPage;
