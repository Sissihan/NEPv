import { LOCALE_LABELS, LOCALES, useI18n } from '../i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="lang-switcher">
      <label htmlFor="locale-select" className="lang-label">
        {t.nav.language}
      </label>
      <select
        id="locale-select"
        className="lang-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        aria-label={t.nav.language}
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
