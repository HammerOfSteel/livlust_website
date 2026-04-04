# Overview — Livslust och hållbart stöd

## Organisation

**Livslust och hållbart stöd** is a Swedish non-profit support organisation (ideell förening) for people who are suicide loss survivors, that is, family members, friends, and close ones who have lost someone to suicide. The organisation was founded by Micke Eklund and Sune Mets, both of whom have lost a child to suicide. It offers community, support, and resources to help survivors navigate grief and rebuild their lives.

## Website Purpose

The website serves as the public face of the organisation. It should:

- Present the organisation and its mission clearly and compassionately
- Provide contact information and a way to reach out
- Be accessible and easy to read for people in vulnerable life situations
- Be primarily in Swedish, with a full English translation available
- Be simple to maintain via the built-in Directus CMS

## Design Direction

- **One-pager layout** with clearly defined sections
- Design inspired by `poster.jpg`: clean, warm, and professional
- Organisation name displayed as a typographic wordmark in the sticky header
- Calm, themeable colour palette (5 themes selectable via `.env`)
- Clear, readable typography with good contrast
- Hero section with a crossfade image slideshow (30-second intervals)
- Accessible (WCAG AA target)

### Page Sections (top to bottom)

1. **Header** — Typographic wordmark ("Livslust / och hallbart stod"), nav links, language toggle (SV/EN)
2. **Hero** — Full-viewport image slideshow with title, subtitle, and CTA
3. **About us** — Two-column layout with body text, a quote bar, and an identity badge card
4. **Upcoming events** — Event cards linking to external booking pages (currently: Knata och Prata, Ostersund 9 April 2026)
5. **Crisis box** — Highlighted band with crisis helpline numbers (Mind 90101, 1177)
6. **Contact form** — Side-by-side info column and card form; submissions stored in Directus
7. **Footer** — Copyright and link to Directus admin

## Technical Architecture

```
livlust_website/
├── docker-compose.yml         # 4 services: db, directus, directus-init, frontend
├── .env.example
├── .gitignore
├── directus/
│   └── seed.mjs               # One-shot bootstrap: collections, fields, permissions, content
├── db/
│   └── init.sql               # Minimal — schema managed by Directus
└── frontend/                  # React + Vite + TypeScript
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx / .css
    │   │   ├── Hero.tsx / .css       # Image slideshow
    │   │   ├── About.tsx / .css
    │   │   ├── Offer.tsx / .css      # Events section
    │   │   ├── Crisis.tsx / .css
    │   │   ├── ContactForm.tsx / .css
    │   │   ├── Footer.tsx / .css
    │   │   └── admin/               # (kept for reference, CMS via Directus)
    │   ├── hooks/
    │   │   └── useSiteContent.ts    # Fetches content from Directus API, cached
    │   ├── i18n/
    │   │   ├── sv.json              # Swedish translations (default)
    │   │   ├── en.json              # English translations
    │   │   └── index.ts
    │   ├── images/
    │   │   └── hero0-10.jpg         # Hero slideshow images
    │   ├── pages/
    │   │   └── Home.tsx
    │   ├── index.css                # Theme variables (5 themes), reset, base styles
    │   └── main.tsx                 # Applies data-theme from VITE_THEME env var
    └── Dockerfile
```

### Docker Compose Services

| Service          | Port  | Description                                          |
|------------------|-------|------------------------------------------------------|
| `db`             | 5432  | PostgreSQL 16                                        |
| `directus`       | 8055  | Directus CMS (headless, self-hosted)                 |
| `directus-init`  | -     | One-shot Node script: bootstraps schema and content  |
| `frontend`       | 3000  | Vite React dev server                                |

### CMS: Directus

Directus acts as the full CMS and replaces the custom Express backend. It provides:

- A polished admin UI at `http://localhost:8055/admin`
- User management with roles (superadmin, admin) built in
- `page_content` collection: section key + language + body text, editable per section/language
- `contact_submissions` collection: stores all contact form submissions
- Public read permission on `page_content`, public create on `contact_submissions`
- The frontend fetches content at runtime via the Directus REST API and caches it in memory; static i18n JSON is the fallback

### Theme System

Five colour themes are defined in `frontend/src/index.css` using CSS custom properties on `[data-theme="..."]`. The active theme is set by `VITE_THEME` in `.env` and applied to `<html data-theme="...">` at app startup.

Available themes: `ocean` (default), `forest`, `nordic`, `sunset`, `lavender`.

### i18n Strategy

- All user-facing strings in `sv.json` (Swedish, default) and `en.json` (English)
- Language toggle in the sticky header switches language instantly
- Content from Directus overrides i18n strings when available (enabling live CMS editing)
- No em-dashes in any user-facing text content
