import { useTranslation } from 'react-i18next';
import './BlogHeader.css';

export default function BlogHeader() {
  const { i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'sv' ? 'en' : 'sv');

  return (
    <header className="blog-header">
      <a className="blog-header__back" href="/#news">
        {i18n.language === 'en' ? '← Back' : '← Tillbaka'}
      </a>
      <a className="blog-header__logo" href="/">Livslust</a>
      <button
        className="blog-header__lang"
        onClick={toggleLang}
        aria-label={`Byt språk till ${i18n.language === 'sv' ? 'English' : 'Svenska'}`}
      >
        {i18n.language === 'sv' ? 'EN' : 'SV'}
      </button>
    </header>
  );
}
