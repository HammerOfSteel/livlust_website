import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <section id="about">
      <div className="container">
        <h2>{t('about.heading')}</h2>
        <p>{t('about.body')}</p>
      </div>
    </section>
  );
}
