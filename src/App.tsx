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
      <main>
        <Hero />
        <Compare />
        <Playground />
        <Pitfalls />
        <References />
      </main>
      <Footer />
    </>
  );
}
