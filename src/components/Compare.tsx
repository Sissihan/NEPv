import { useI18n } from '../i18n';
import { MathBlock } from './MathBlock';

export function Compare() {
  const { t } = useI18n();

  return (
    <section id="compare" className="compare-section">
      <div className="container">
        <h2 className="compare-heading">{t.compare.title}</h2>

        <div className="compare-strip">
          <article className="card compare-panel compare-panel-def">
            <h3>{t.compare.nepDefinitionTitle}</h3>
            <p className="compare-def-text">{t.compare.nepDefinition}</p>
            <MathBlock
              tex="A(x)\,x = \lambda x,\quad x \neq 0,\quad x \in \mathrm{eig}(A(x))"
              block={false}
            />
          </article>

          <article className="card compare-panel">
            <h3>{t.compare.linearTitle}</h3>
            <MathBlock tex="A\,x = \lambda x" block={false} />
            <p>{t.compare.linearBody}</p>
          </article>

          <article className="card compare-panel">
            <h3>{t.compare.nepTitle}</h3>
            <MathBlock tex="A(x)\,x = \lambda x" block={false} />
            <p>{t.compare.nepBody}</p>
          </article>
        </div>

        <p className="compare-note">{t.compare.note}</p>
      </div>
    </section>
  );
}
