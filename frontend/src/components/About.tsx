import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../hooks/useSiteContent';
import logoImg from '../images/logo.png';
import './About.css';

export default function About() {
  const { t } = useTranslation();
  const cms = useSiteContent();

  return (
    <section id="about">
      <div className="container about-grid">
        <div className="about-text">
          <h2>{cms.about_heading ?? t('about.heading')}</h2>
          <p className="section-intro">{cms.about_body ?? t('about.body')}</p>
          <blockquote className="about-quote">
            "Sorgen bevisar kärlekens storlek.<br />Vi bär den tillsammans."
          </blockquote>
        </div>
        <div className="about-badge">
          <img src={logoImg} alt="Livslust logotyp" className="about-badge-logo" />
        </div>
      </div>
    </section>
  );
}
