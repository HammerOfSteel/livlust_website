import { useTranslation } from 'react-i18next';
import './Header.css';

export default function Header() {
  const { t, i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'sv' ? 'en' : 'sv');

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="/" className="header-logo" aria-label="Hem">
          <span className="header-wordmark">
            <span className="header-wordmark-main">Livslust</span>
            <span className="header-wordmark-sub">och hållbart stöd</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Sidonavigation">
          <a href="#about">{t('nav.about')}</a>
          <a href="#offer">{t('nav.offer')}</a>
          <a href="#contact">{t('nav.contact')}</a>
        </nav>

        <button
          className="lang-toggle"
          onClick={toggleLang}
          aria-label={`Byt språk till ${i18n.language === 'sv' ? 'English' : 'Svenska'}`}
        >
          {i18n.language === 'sv' ? 'EN' : 'SV'}
        </button>
      </div>
    </header>
  );
}
