import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Offer.css';

interface Event {
  id: number;
  title: string;
  tagline: string | null;
  event_date: string;
  time_label: string | null;
  location: string | null;
  organizers: string | null;
  description: string | null;
  external_url: string | null;
  badge: string | null;
  partner: string | null;
}

function formatDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Offer() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang  = isEn ? 'en' : 'sv';

  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/cms/items/events?filter[language][_eq]=${lang}&filter[status][_eq]=published&sort=event_date&fields=*`
    )
      .then(r => r.json())
      .then(d => setEvents(d.data ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <section id="offer">
      <div className="container">
        <h2>{isEn ? 'Upcoming events' : 'Kommande aktiviteter'}</h2>
        <p className="section-intro">
          {isEn
            ? 'Join us for walks, talks and gatherings. Everyone is welcome regardless of how long ago the loss happened.'
            : 'Kom och delta i promenader, samtal och träffar. Alla är välkomna oavsett när förlusten hände.'}
        </p>

        {loading && (
          <p className="events-loading">{isEn ? 'Loading events…' : 'Laddar evenemang…'}</p>
        )}

        {!loading && events.length === 0 && (
          <p className="events-empty">
            {isEn
              ? 'No upcoming events right now. Check back soon!'
              : 'Inga kommande evenemang just nu. Kika in snart igen!'}
          </p>
        )}

        {!loading && events.length > 0 && (
          <div className="event-cards">
            {events.map(ev => (
              ev.external_url ? (
                <a
                  key={ev.id}
                  href={ev.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-card"
                  aria-label={isEn ? `Read more about ${ev.title}` : `Läs mer om ${ev.title}`}
                >
                  <EventCardInner ev={ev} isEn={isEn} lang={lang} />
                </a>
              ) : (
                <div key={ev.id} className="event-card event-card--no-link">
                  <EventCardInner ev={ev} isEn={isEn} lang={lang} />
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventCardInner({ ev, isEn, lang }: { ev: Event; isEn: boolean; lang: string }) {
  return (
    <>
      {(ev.badge || ev.partner) && (
        <div className="event-card-header">
          {ev.badge && <span className="event-badge">{ev.badge}</span>}
          {ev.partner && (
            <span className="event-partner">
              {isEn ? 'In cooperation with' : 'I samarbete med'} {ev.partner}
            </span>
          )}
        </div>
      )}

      <h3 className="event-title">{ev.title}</h3>
      {ev.tagline && <p className="event-tagline">{ev.tagline}</p>}

      <ul className="event-meta">
        <li>
          <span className="event-meta-icon" aria-hidden="true">📅</span>
          <span>
            {formatDate(ev.event_date, lang)}
            {ev.time_label ? `, ${ev.time_label}` : ''}
          </span>
        </li>
        {ev.location && (
          <li>
            <span className="event-meta-icon" aria-hidden="true">📍</span>
            <span>{ev.location}</span>
          </li>
        )}
        {ev.organizers && (
          <li>
            <span className="event-meta-icon" aria-hidden="true">👥</span>
            <span>{ev.organizers}</span>
          </li>
        )}
      </ul>

      {ev.description && <p className="event-description">{ev.description}</p>}

      {ev.external_url && (
        <span className="event-cta-link">
          {isEn ? 'Sign up and read more' : 'Anmäl dig och läs mer'} &rarr;
        </span>
      )}
    </>
  );
}

