import { useI18n } from '../i18n';
import { MathBlock } from './MathBlock';

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="hero">
      <div className="container">
        <h2 className="compare-heading">{t.hero.title}</h2>
        <p className="lead">{t.hero.lead}</p>
        <MathBlock tex="A(x)\,x = \lambda x,\quad r(x,\lambda)=\|A(x)x-\lambda x\|_2" />
        <p>{t.hero.footnote}</p>
      </div>
    </section>
  );
}
