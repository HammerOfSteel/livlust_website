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
- [x] `posts` collection in Directus (title, excerpt, body rich-text, published_at, image_key, image_alt, language, status)
- [x] Public-facing news section on the site — card grid, inline expand/collapse to read full article

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

---

## Verksamhetsutveckling

### Marknadsföring och synlighet
- [ ] Skapa en innehållsplan för Instagram och Facebook — ex. en post/vecka: citat, aktiviteter, bakgrundshistorier
- [ ] Producera en kort "Vilka är vi"-video (60 sek) för sociala medier och hemsidan
- [ ] Sätt upp Google Ad Grants — ideella organisationer kan få upp till 10 000 USD/månad i gratis Google-annonser
- [ ] Skriv pressreleaser till lokala medier (Norran, VK, P4 Västernorrland) om lanseringen och kommande träffar
- [ ] Kontakta SVT/SR för eventuell medverkan i reportage om suicidförlust och efterlevandes stöd
- [ ] Skapa en hashtag-strategi: #livslust #efterlevande #suicidförlust #hållbartstöd
- [ ] Dela aktiviteter och träffar i relevanta Facebook-grupper för sorg och psykisk hälsa
- [ ] Skapa en Google My Business-profil för lokal synlighet

### Finansiering — Bidrag och fonder
- [ ] **Allmänna arvsfonden** — Huvudfond för ideella org som arbetar med utsatta grupper. Hög relevans. Ansökan löpande, upp till 3 år. https://arvsfonden.se
- [ ] **Folkhälsomyndigheten** — Bidrag för suicidprevention och psykisk hälsa. Utlysningar vanligen höst. https://folkhalsomyndigheten.se
- [ ] **Familjen Kamprads stiftelse** — Stödjer hälsa och välmående, särskilt på landsbygden. Passar Burträsk-basen väl. https://www.kampr adsstiftelse.se
- [ ] **Radiohjälpen** — Stödjer org som hjälper människor i utsatta situationer i Sverige. https://radiohjalpen.se
- [ ] **Postkodsstiftelsen** — Stödjer civilsamhällesorganisationer med samhällsnytta. https://postkodsstiftelsen.se
- [ ] **Region Västerbotten** — Regionala folkhälsobidrag och föreningsbidrag. Kontakta Hälso- och sjukvårdsavdelningen.
- [ ] **Länsstyrelsen Västerbotten** — Bidrag till ideella föreningar, särskilt inom social omsorg.
- [ ] **Kommunbidrag Skellefteå/Norsjö** — Lokala föreningsbidrag, ansök hos respektive kommun.
- [ ] **Norrbacka-Eugeniastiftelsen** — Stödjer arbete för människor med funktionsnedsättning och psykisk ohälsa.
- [ ] **Stiftelsen Sunnerdahls Handikappfond** — Hälsa och socialt arbete.
- [ ] **MUCF (Myndigheten för ungdoms- och civilsamhällesfrågor)** — Organisationsbidrag för etablerade föreningar. https://mucf.se
- [ ] Upprätta intern bidragskalender med deadlines för ansökningar

### Finansiering — Övriga insamlingsvägar
- [ ] Sätt upp Swish-insamling för enskilda donationer (Swish Handel för ideella org)
- [ ] Skapa en "Stöd oss"-sida på hemsidan med information om hur man donerar
- [ ] Undersök möjligheten att bli 90-konto-organisation (Svensk Insamlingskontroll) för ökad trovärdighet
- [ ] Sätt upp minnesinsamlingar — samarbeta med begravningsbyråer för att erbjudas som insamlingsändamål
- [ ] Crowdfunding-kampanj (Kickstarter, Forska!Sverige, eller Insamlingsstiftelse) för specifikt projekt/aktivitet
- [ ] Företagssponsring — kontakta lokala företag i Skellefteå/Burträsk för partnerskap och sponsring

### Partnerskap och samarbeten
- [ ] **SPES** (Riksförbundet för suicidprevention och efterlevandes stöd) — Naturlig samarbetspartner och möjlighet till nätverksstöd. https://spes.se
- [ ] **Suicide Zero** — Riksorganisation för suicidprevention, möjliga gemensamma kampanjer. https://suicidezero.se
- [ ] **Mind Sverige** — Redan refererade (Självmordslinjen), formalisera samarbetet. https://mind.se
- [ ] **Svenska Sorgeinstitutet** — Redan nämnda i verksamheten, formalisera utbildningssamarbete.
- [ ] **NSPH** (Nationell Samverkan för Psykisk Hälsa) — Paraplyorganisation, ansök om medlemskap.
- [ ] **1177 / Regionen** — Bli en rekommenderad resurs för vårdpersonal som möter efterlevande.
- [ ] Kontakta begravningsbyråer i Västerbotten — de möter efterlevande direkt och kan hänvisa.
- [ ] Samarbete med kyrkor och trossamfund som erbjuder sorgstöd.
- [ ] Kontakta Medborgarskolan (redan partner) om utökat samarbete och lokalbidrag.

### Föreläsningar och utbildning
- [ ] Ta fram en presentationsbroschyr/pitch för föreläsningsverksamheten (skolor, sjukhus, företag)
- [ ] Sätt ett pris/taxa för föreläsningar — gratis för skolor, avgift för företag/organisationer
- [ ] Kontakta rektorer och kuratorer på gymnasieskolor i Västerbotten och Dalarna
- [ ] Kontakta HR-avdelningar på större arbetsgivare i regionen (Skellefteå Kraft, SSAB, Region Västerbotten)
- [ ] Kontakta psykiatrimottagningar och vårdcentraler om utbildningsinsatser för personal
- [ ] Anmäl organisationen till föreläsarkataloger (t.ex. Eventeffect, Talare.se)
- [ ] Skapa en enkel PDF-folder om föreläsningserbjudandet att skicka till potentiella uppdragsgivare
- [ ] Undersök om Studieförbunden (ABF, Studiefrämjandet) kan samordna och marknadsföra föreläsningar

