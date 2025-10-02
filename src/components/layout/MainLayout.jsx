import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-content">{children}</main>
      <Footer />
    </div>
  );
}
