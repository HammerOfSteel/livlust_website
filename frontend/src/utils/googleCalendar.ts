// Fetches events directly from the public Livslust Google Calendar (single
// source of truth — no more duplicating events into Directus). The calendar
// is public, so a restricted browser API key is enough; Google sends CORS
// headers for this endpoint so no server-side proxy is needed.
//
// Convention for bilingual events (documented in docs/lagg-till-evenemang.md):
// the Description field holds the Swedish text, optionally followed by a
// line containing "--EN--" after which the English translation goes.

export interface CalendarEvent {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  time_label: string | null; // e.g. "18:00-19:30", null for all-day events
  location: string | null;
  descriptionHtmlSv: string;
  descriptionHtmlEn: string | null;
}

const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID ?? 'info@livslusths.se';
const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

const EN_MARKER = /--\s*EN\s*--/i;

function splitLanguages(html: string): { sv: string; en: string | null } {
  const match = EN_MARKER.exec(html);
  if (!match) return { sv: html.trim(), en: null };
  return {
    sv: html.slice(0, match.index).trim(),
    en: html.slice(match.index + match[0].length).trim() || null,
  };
}

function formatTimeLabel(
  start: { dateTime?: string },
  end: { dateTime?: string }
): string | null {
  if (!start.dateTime || !end.dateTime) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Stockholm',
    });
  return `${fmt(start.dateTime)}-${fmt(end.dateTime)}`;
}

interface GoogleCalendarApiEvent {
  id: string;
  status: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  if (!API_KEY) {
    console.error('Missing VITE_GOOGLE_CALENDAR_API_KEY — cannot load calendar events.');
    return [];
  }

  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - 3); // keep recently-past events for the "show past" toggle
  const timeMax = new Date();
  timeMax.setFullYear(timeMax.getFullYear() + 1); // bound recurring events to a year out

  const items: GoogleCalendarApiEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      key: API_KEY,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
    });
    if (pageToken) params.set('pageToken', pageToken);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`);
    const data = await res.json();
    items.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items
    .filter(item => item.status !== 'cancelled')
    .map(item => {
      const { sv, en } = splitLanguages(item.description ?? '');
      const event_date = item.start?.dateTime
        ? item.start.dateTime.slice(0, 10)
        : (item.start?.date ?? '');
      return {
        id: item.id,
        title: item.summary ?? '',
        event_date,
        time_label: formatTimeLabel(item.start ?? {}, item.end ?? {}),
        location: item.location ?? null,
        descriptionHtmlSv: sv,
        descriptionHtmlEn: en,
      };
    })
    .filter(ev => ev.event_date);
}
