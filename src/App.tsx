import { Compare } from './components/Compare';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Pitfalls } from './components/Pitfalls';
import { Playground } from './components/Playground';
import { References } from './components/References';
import { useI18n } from './i18n';

function Footer() {
  const { t } = useI18n();
  return (
    <footer>
      <div className="container">{t.footer}</div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <main className="page-main">
        <div className="intro-band">
          <Hero />
          <div className="intro-divider" role="separator" aria-hidden="true" />
          <Compare />
        </div>
        <Playground />
        <Pitfalls />
        <References />
      </main>
      <Footer />
    </>
  );
}
