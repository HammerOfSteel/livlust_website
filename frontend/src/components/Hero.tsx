import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../hooks/useSiteContent';
import './Hero.css';

// Eagerly import all hero images from src/images/
const imageModules = import.meta.glob('../images/hero*.jpg', { eager: true });
const heroImages = Object.values(imageModules).map((m: any) => m.default as string);

const INTERVAL_MS = 30_000;
const FADE_MS = 2000;

export default function Hero() {
  const { t } = useTranslation();
  const cms = useSiteContent();

  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive(i => (i + 1) % heroImages.length);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const title    = cms.hero_title    ?? t('hero.title');
  const subtitle = cms.hero_subtitle ?? t('hero.subtitle');

  return (
    <section className="hero">
      {/* Background slideshow */}
      <div className="hero-slides" aria-hidden="true">
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`hero-slide${i === active ? (fading ? ' is-active is-fading' : ' is-active') : ''}`}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="container hero-inner">
        <p className="hero-eyebrow">Livslust och hållbart stöd</p>
        <h1>{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <a href="#contact" className="btn hero-cta">
          {t('hero.cta')} →
        </a>
      </div>
    </section>
  );
}
