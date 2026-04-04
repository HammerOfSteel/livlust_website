import { useTranslation } from 'react-i18next';
import { useSiteContent } from '../hooks/useSiteContent';
import './Offer.css';

export default function Offer() {
  const { t } = useTranslation();
  const cms = useSiteContent();

  const cards = [
    {
      icon: '🤝',
      heading: t('offer.groups_heading'),
      body: cms.offer_groups ?? t('offer.groups_body'),
    },
    {
      icon: '💬',
      heading: t('offer.talk_heading'),
      body: cms.offer_talk ?? t('offer.talk_body'),
    },
    {
      icon: '📚',
      heading: t('offer.resources_heading'),
      body: cms.offer_resources ?? t('offer.resources_body'),
    },
  ];

  return (
    <section id="offer">
      <div className="container">
        <h2>{cms.offer_heading ?? t('offer.heading')}</h2>
        <div className="offer-cards">
          {cards.map(card => (
            <div className="offer-card" key={card.heading}>
              <span className="offer-icon" aria-hidden="true">{card.icon}</span>
              <h3>{card.heading}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
