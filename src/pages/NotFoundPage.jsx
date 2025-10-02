import { MainLayout } from '../components/layout/MainLayout';

export function NotFoundPage() {
  return (
    <MainLayout>
      <section className="section">
        <div className="container not-found">
          <h1>Page not found</h1>
          <p>The page you were looking for could not be located.</p>
          <a className="button button--primary" href="/">
            Back to home
          </a>
        </div>
      </section>
    </MainLayout>
  );
}
