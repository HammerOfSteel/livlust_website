# Todo — Livslust och hållbart stöd

## MVP

### Infrastructure
- [x] README.md, overview.md, todo.md created and up to date
- [x] `docker-compose.yml` — db, Directus, directus-init, frontend
- [x] `.env.example` with all required environment variables
- [x] `.gitignore`
- [x] `db/init.sql` (minimal — schema managed by Directus)
- [x] `directus/seed.mjs` — idempotent bootstrap: collections, fields, permissions, seed content

### Frontend
- [x] Vite + React + TypeScript scaffold
- [x] i18n setup (react-i18next) with `sv` and `en` JSON files
- [x] Language toggle (SV/EN) in sticky header
- [x] 5-theme CSS variable system (`VITE_THEME` in `.env`)
- [x] Landing page, one-pager with sections:
  - [x] Header — typographic wordmark, nav links, language toggle
  - [x] Hero — full-viewport crossfade image slideshow (30s interval)
  - [x] About us — two-column layout with quote and badge card
  - [x] Events section — event cards with external links (Knata och Prata, Ostersund 9 Apr)
  - [x] Crisis box — Mind Sjalvmordslinjen 90101, 1177
  - [x] Contact form — card layout, stores submissions in Directus
  - [x] Footer — copyright + Directus admin link
- [x] `useSiteContent` hook — fetches and caches content from Directus at runtime
- [x] Responsive design (mobile-first)

### CMS
- [x] Directus self-hosted via Docker image
- [x] `page_content` collection (section, language, body) — public read
- [x] `contact_submissions` collection — public create
- [x] Admin UI at `http://localhost:8055/admin`
- [x] User management built into Directus
- [x] Content seeded for all sections in Swedish and English

### DevOps
- [x] Dockerfile for frontend
- [x] docker-compose.yml with health checks and service dependencies
- [x] Git repo initialised, pushed to HammerOfSteel/livlust_website on GitHub

---

## Next steps (short term)

- [ ] Add a real logo/logotype image (replace typographic wordmark or complement it)
- [ ] WCAG AA accessibility audit and fixes
- [ ] Meta tags, Open Graph image, `<title>` per section for SEO
- [ ] `robots.txt` and `sitemap.xml`
- [ ] Verify all EN content in Directus (some items hit rate limit on first seed — re-run `directus-init` if needed)
- [ ] Change default passwords in `.env` before any public deployment
- [ ] Add a second upcoming event card once more events are scheduled

---

## Beyond MVP — Suggested Features

### Features we the org wants first
- [x] What we do section — accordion with Samtalsträffar, Knata och Prata (walk and talk, general + men's group), Föreläsningar (schools/companies/hospitals), Sorgbearbetning (Svenska Sorgeinstitutet), Digitala samtalsträffar
- [x] Social media icons (Discord, Instagram, Facebook) in bottom-left of hero with scale + brand-colour hover effect; placeholder URLs ready to swap in

### Events management via Directus
- [x] `events` collection in Directus (title, tagline, date, time_label, location, organizers, description, external_url, badge, partner, language, status)
- [x] Frontend fetches events from Directus instead of hardcoding them (loading + empty state)
- [x] Admin creates, edits, deletes events through Directus UI
- [x] iCal export link per event

### Blog / News
- [ ] `posts` collection in Directus (title, body, published_at, language)
- [ ] Public-facing news section on the site part of the onepager design

### Newsletter / Mailing List
- [ ] Email sign-up form on landing page
- [ ] `subscribers` collection in Directus
- [ ] Integration with a mailing provider (Mailchimp, Brevo)

### Media and Resources
- [ ] Admin: upload documents (PDFs, guides) via Directus Files
- [ ] Public: downloadable resources section

### Improved Contact Flow
- [ ] Email notification to org when a contact form submission is created (Directus Flow)
- [ ] Auto-reply email to sender
- [ ] Spam protection (honeypot field or reCAPTCHA)

### SEO and Accessibility
- [ ] Full WCAG AA audit
- [ ] Swedish-language structured data (schema.org NonProfit)

### Security Hardening
- [ ] Review Directus CORS and rate limiter config for production
- [ ] HTTPS + secure headers via reverse proxy (Caddy or nginx) in production

### Analytics
- [ ] Privacy-friendly analytics (Plausible or Umami) as a Docker service

### Multi-language Expansion
- [ ] Additional languages (Arabic, Somali) to serve diverse communities in Sweden

