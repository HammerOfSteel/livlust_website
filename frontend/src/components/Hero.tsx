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

      {/* Social links — bottom-left */}
      <div className="hero-social" aria-label={t('hero.social_label')}>
        <a
          href="https://discord.gg/ReXE6DTEuK"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-social-link hero-social-discord"
          aria-label="Discord"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </a>
        <a
          href="https://www.instagram.com/livslust_och_hallbartstod/"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-social-link hero-social-instagram"
          aria-label="Instagram"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.333.014 8.741 0 12 0zm0 2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668 2.177 15.259 2.163 12 2.163zm0 3.676a6.162 6.162 0 1 1 0 12.324 6.162 6.162 0 0 1 0-12.324zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.406-11.845a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z" />
          </svg>
        </a>
        <a
          href="https://www.facebook.com/61572334714535"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-social-link hero-social-facebook"
          aria-label="Facebook"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.931-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
        </a>
      </div>
    </section>
  );
}
