import { useTranslation } from 'react-i18next';

export default function Offer() {
  const { t } = useTranslation();
  return (
    <section id="offer">
      <div className="container">
        <h2>{t('offer.heading')}</h2>
        <p>{t('offer.body')}</p>
      </div>
    </section>
  );
}
