import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { fetchCalendarEvents, type CalendarEvent } from '../utils/googleCalendar';
import './Offer.css';

type Event = CalendarEvent;

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function parseTimeLabel(label: string | null): { start: string; end: string } | null {
  if (!label) return null;
  const m = label.match(/(\d{1,2}):(\d{2})[^\d]+(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { start: m[1].padStart(2, '0') + m[2], end: m[3].padStart(2, '0') + m[4] };
}

function buildIcs(ev: Event, description: string): string {
  const datePart = ev.event_date.replace(/-/g, '');
  const times = parseTimeLabel(ev.time_label);
  const dtstart = times ? `DTSTART:${datePart}T${times.start}00` : `DTSTART;VALUE=DATE:${datePart}`;
  const dtend   = times ? `DTEND:${datePart}T${times.end}00`   : `DTEND;VALUE=DATE:${datePart}`;
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//Livslust//Events//SV', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:livslust-${ev.id}@livslusths.se`,
    `SUMMARY:${esc(ev.title)}`,
    dtstart, dtend,
    ev.location ? `LOCATION:${esc(ev.location)}` : '',
    description ? `DESCRIPTION:${esc(stripHtml(description))}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  return lines.join('\r\n');
}

function downloadIcs(ev: Event, description: string) {
  const blob = new Blob([buildIcs(ev, description)], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${ev.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showPast, setShowPast] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchCalendarEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastEvent = (eventDate: string): boolean => {
    const evDate = new Date(eventDate + 'T12:00:00');
    evDate.setHours(0, 0, 0, 0);
    return evDate < today;
  };

  // Extract unique locations from events (simplified city names)
  const getSimplifiedLocation = (location: string | null): string => {
    if (!location) return '';
    if (location.toLowerCase().includes('online') || /^https?:\/\//i.test(location)) return 'Online';
    if (location.toLowerCase().includes('östersund')) return 'Östersund';
    if (location.toLowerCase().includes('gevåg')) return 'Gevåg';
    if (location.toLowerCase().includes('skellefteå')) return 'Skellefteå';
    if (location.toLowerCase().includes('strömsund')) return 'Strömsund';
    if (location.toLowerCase().includes('ystad')) return 'Ystad';
    return location.split(',')[0].trim(); // fallback: first part before comma
  };

  const uniqueLocations = Array.from(
    new Set(events.map(ev => getSimplifiedLocation(ev.location)).filter(Boolean))
  ).sort();

  // Filter events by selected location and past/future
  let filteredEvents = locationFilter === 'all'
    ? events
    : events.filter(ev => getSimplifiedLocation(ev.location) === locationFilter);
  
  if (!showPast) {
    filteredEvents = filteredEvents.filter(ev => !isPastEvent(ev.event_date));
  }

  // Reset carousel index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [locationFilter, showPast]);

  const cardsPerPage = 2;
  const totalPages = Math.ceil(filteredEvents.length / cardsPerPage);

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleEvents = filteredEvents.slice(
    currentIndex * cardsPerPage,
    (currentIndex + 1) * cardsPerPage
  );

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
          <>
            <div className="event-filters">
              <button
                className={`event-filter-btn${locationFilter === 'all' ? ' active' : ''}`}
                onClick={() => setLocationFilter('all')}
              >
                {isEn ? 'All locations' : 'Alla platser'}
              </button>
              {uniqueLocations.map(loc => (
                <button
                  key={loc}
                  className={`event-filter-btn${locationFilter === loc ? ' active' : ''}`}
                  onClick={() => setLocationFilter(loc)}
                >
                  {loc}
                </button>
              ))}
              <button
                className={`event-filter-btn event-filter-btn--past${showPast ? ' active' : ''}`}
                onClick={() => setShowPast(!showPast)}
                title={isEn ? 'Show past events' : 'Visa tidigare händelser'}
              >
                {isEn ? 'Show past' : 'Visa tidigare'}
              </button>
            </div>

            {filteredEvents.length === 0 ? (
              <p className="events-empty">
                {isEn
                  ? 'No events match the selected filters.'
                  : 'Inga evenemang matchar de valda filtren.'}
              </p>
            ) : (
              <div className="event-carousel">
                {totalPages > 1 && (
                  <button
                    className="carousel-arrow carousel-arrow--prev"
                    onClick={prevPage}
                    aria-label={isEn ? 'Previous events' : 'Föregående evenemang'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                )}

                <div className="event-cards">
                  {visibleEvents.map(ev => {
                    const pastEvent = isPastEvent(ev.event_date);
                    return (
                      <div key={ev.id} className={`event-card event-card--no-link${pastEvent ? ' event-card--past' : ''}`}>
                        <EventCardInner ev={ev} isEn={isEn} lang={lang} isPast={pastEvent} />
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <button
                    className="carousel-arrow carousel-arrow--next"
                    onClick={nextPage}
                    aria-label={isEn ? 'Next events' : 'Nästa evenemang'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="carousel-dots">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`carousel-dot${idx === currentIndex ? ' active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={isEn ? `Go to page ${idx + 1}` : `Gå till sida ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function EventCardInner({ ev, isEn, lang, isPast }: { ev: Event; isEn: boolean; lang: string; isPast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const descriptionHtml = (isEn ? ev.descriptionHtmlEn : null) ?? ev.descriptionHtmlSv;
  const descriptionText = stripHtml(descriptionHtml);

  return (
    <>
      {isPast && (
        <div className="event-card-header">
          <span className="event-badge event-badge--past">
            {isEn ? 'Past event' : 'Tidigare händelse'}
          </span>
        </div>
      )}

      <h3 className="event-title">{ev.title}</h3>

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
      </ul>

      {descriptionHtml && (
        <>
          <div
            className={`event-description${isExpanded ? ' expanded' : ''}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(descriptionHtml) }}
          />
          {descriptionText.length > 150 && (
            <button
              className="event-expand-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
            >
              {isExpanded ? (isEn ? 'Show less' : 'Visa mindre') : (isEn ? 'Read more' : 'Läs mer')}
            </button>
          )}
        </>
      )}

      <div className="event-card-footer">
        {!isPast && (
          <a
            href="mailto:info@livslusths.se"
            className="event-email-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            {isEn ? 'Register via email' : 'Anmäl dig via mail'}
          </a>
        )}
        <button
          className="event-ical-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadIcs(ev, descriptionHtml); }}
          aria-label={isEn ? `Add ${ev.title} to calendar` : `Lägg till ${ev.title} i kalendern`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {isEn ? 'Add to calendar' : 'Spara i kalender'}
        </button>
      </div>
    </>
  );
}

