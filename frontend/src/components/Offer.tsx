import { useTranslation } from 'react-i18next';
import './Offer.css';

const EVENT_URL =
  'https://www.medborgarskolan.se/arrangemang-sok/knata-prata-for-efterlevande-till-suicid-med-livslust-hallbart-stod-1504163/';

export default function Offer() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <section id="offer">
      <div className="container">
        <h2>{isEn ? 'Upcoming events' : 'Kommande aktiviteter'}</h2>
        <p className="section-intro">
          {isEn
            ? 'Join us for walks, talks and gatherings. Everyone is welcome regardless of how long ago the loss happened.'
            : 'Kom och delta i promenader, samtal och treffar. Alla ar valkomna oavsett nar forlusten hande.'}
        </p>

        <div className="event-cards">
          <a
            href={EVENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="event-card"
            aria-label={isEn ? 'Read more about Knata and Prata' : 'Las mer om Knata och Prata'}
          >
            <div className="event-card-header">
              <span className="event-badge">{isEn ? 'Free' : 'Gratis'}</span>
              <span className="event-partner">
                {isEn ? 'In cooperation with' : 'I samarbete med'} Medborgarskolan
              </span>
            </div>

            <h3 className="event-title">Knata och Prata</h3>
            <p className="event-tagline">
              {isEn
                ? 'For survivors of suicide loss'
                : 'For efterlevande till suicid'}
            </p>

            <ul className="event-meta">
              <li>
                <span className="event-meta-icon" aria-hidden="true">📅</span>
                <span>{isEn ? 'Thursday 9 April 2026, 18:00-19:00' : 'Torsdag 9 april 2026, kl 18:00-19:00'}</span>
              </li>
              <li>
                <span className="event-meta-icon" aria-hidden="true">📍</span>
                <span>Hotell Ostersund, Kyrkgatan 70, Ostersund</span>
              </li>
              <li>
                <span className="event-meta-icon" aria-hidden="true">👥</span>
                <span>Micke Eklund &amp; Sune Mets</span>
              </li>
            </ul>

            <p className="event-description">
              {isEn
                ? 'A walk and talk session for those who have lost someone to suicide. Hosted by Micke and Sune, both founders of Livslust and suicide loss survivors themselves. Walk at your own pace and share as much or as little as you like. Warmly welcome!'
                : 'En promenad och samtal for dig som mist nagon i suicid. Mikke och Sune, bada grundare av Livslust och sjalva efterlevande, leder traeffen. Ga i din takt och dela sa mycket eller lite du vill. Varmt valkommen!'}
            </p>

            <span className="event-cta-link">
              {isEn ? 'Sign up and read more' : 'Anmal dig och las mer'} &rarr;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

