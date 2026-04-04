import { useTranslation } from 'react-i18next';
import './Header.css';

export default function Header() {
  const { i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'sv' ? 'en' : 'sv');

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo-wrap">
          <img src="/logo.png" alt="Livslust logotyp" className="logo-img" />
        </div>
        <button className="lang-toggle btn btn-primary" onClick={toggleLang} aria-label="Byt språk">
          {i18n.language === 'sv' ? 'EN' : 'SV'}
        </button>
      </div>
    </header>
  );
}
