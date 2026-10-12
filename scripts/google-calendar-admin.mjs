#!/usr/bin/env node
// Read/write helper for the info@livslusths.se Google Calendar, authenticated
// as the service account in keys/google/calendar/*.json (JWT bearer flow, no
// npm deps). That calendar must be shared with the service account's
// client_email with "Make changes to events" permission for writes to work.
import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

const KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  ?? new URL('../keys/google/calendar/livslusths-ce3ac9458850.json', import.meta.url);
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? 'info@livslusths.se';

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken() {
  const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token request failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function api(method, path, body) {
  const token = await getAccessToken();
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null; // DELETE returns 204 with no body
  if (!res.ok) throw new Error(`${method} ${path} failed: ${JSON.stringify(data)}`);
  return data;
}

export const listEvents = (params = '') => api('GET', `/events${params ? `?${params}` : ''}`);
export const insertEvent = (event) => api('POST', '/events', event);
export const patchEvent = (id, patch) => api('PATCH', `/events/${id}`, patch);
export const deleteEvent = (id) => api('DELETE', `/events/${id}`);
