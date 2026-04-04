import { useTranslation } from 'react-i18next';
import './Hero.css';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="hero">
      <div className="container hero-inner">
        <h1>{t('hero.title')}</h1>
        <p className="hero-subtitle">{t('hero.subtitle')}</p>
        <a href="#contact" className="btn btn-primary hero-cta">
          {t('contact.heading')} →
        </a>
      </div>
    </section>
  );
}
