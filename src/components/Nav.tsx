import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Nav() {
  const { t } = useI18n();

  const links = [
    { href: '#hero', label: t.nav.home },
    { href: '#compare', label: t.nav.compare },
    { href: '#playground', label: t.nav.playground },
    { href: '#pitfalls', label: t.nav.pitfalls },
    { href: '#references', label: t.nav.references },
    { href: '#playground', label: t.nav.aiTutor },
  ];

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <a className="brand" href="#hero">
          {t.nav.brand}
        </a>
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
