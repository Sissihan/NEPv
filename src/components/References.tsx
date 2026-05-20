import { useI18n } from '../i18n';

export function References() {
  const { t } = useI18n();

  return (
    <section id="references" className="references-section">
      <div className="container">
        <h2>{t.references.title}</h2>
        <p>{t.references.intro}</p>
        <ol className="refs-list">
          {t.references.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
