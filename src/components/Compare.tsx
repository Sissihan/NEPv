import { useI18n } from '../i18n';
import { MathBlock } from './MathBlock';

export function Compare() {
  const { t } = useI18n();

  return (
    <section id="compare">
      <div className="container">
        <h2>{t.compare.title}</h2>

        <div className="nepv-definition-banner card">
          <h3>{t.compare.nepDefinitionTitle}</h3>
          <p className="nepv-definition-text">{t.compare.nepDefinition}</p>
          <MathBlock tex="A(x)\,x = \lambda x,\quad x \neq 0,\quad x \in \mathrm{eig}(A(x))" block={false} />
        </div>

        <div className="grid-2">
          <div className="card">
            <h3>{t.compare.linearTitle}</h3>
            <MathBlock tex="A\,x = \lambda x" block={false} />
            <p>{t.compare.linearBody}</p>
          </div>
          <div className="card">
            <h3>{t.compare.nepTitle}</h3>
            <MathBlock tex="A(x)\,x = \lambda x" block={false} />
            <p>{t.compare.nepBody}</p>
          </div>
        </div>
        <p className="compare-note">{t.compare.note}</p>
      </div>
    </section>
  );
}
