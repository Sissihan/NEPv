import { useI18n } from '../i18n';

export function References() {
  const { t } = useI18n();

  return (
    <section id="references" className="references-section">
      <div className="container refs-container">
        <details className="refs-collapsible">
          <summary>
            <h2 className="refs-summary-title">{t.references.title}</h2>
          </summary>
          <div className="refs-collapsible-body">
            <p>{t.references.intro}</p>
            <ol className="refs-list">
              {t.references.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>
        </details>
      </div>
    </section>
  );
}
