# Overview — Livslust och hållbart stöd

## Organisation

**Livslust och hållbart stöd** is a Swedish non-profit support organisation (ideell förening) for people who are suicide loss survivors — that is, family members, friends, and close ones who have lost someone to suicide. The organisation offers community, support, and resources to help survivors navigate grief and rebuild their lives.

## Website Purpose

The website serves as the public face of the organisation. It should:

- Present the organisation and its mission clearly and compassionately
- Provide contact information and a way to reach out
- Be accessible and easy to read for people in vulnerable life situations
- Be primarily in Swedish, with a full English translation available
- Be simple to maintain via a built-in CMS admin area

## Design Direction

- **One-pager layout** with clearly defined sections
- Design inspired by `poster.jpg`: clean, warm, and professional
- Logo displayed prominently at the top (header/hero)
- Calm colour palette — likely soft blues, greens, or warm neutrals
- Clear, readable typography
- Accessible (WCAG AA)

### Page Sections (top → bottom)

1. **Header / Hero** — Logo, organisation name, tagline
2. **About us** — Short description of the organisation and its mission
3. **What we offer** — Support services, events, community
4. **Contact / Footer** — Address, email, phone, social links + contact form
5. Footer also contains: language toggle (SV / EN) and an **Admin login** link

## Technical Architecture

```
livlust_website/
├── docker-compose.yml
├── .env.example
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.tsx         # One-pager landing page
│   │   │   └── AdminLogin.tsx   # Admin login page
│   │   ├── i18n/                # Swedish + English translations
│   │   └── main.tsx
│   └── Dockerfile
├── backend/           # Express + TypeScript REST API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts          # Admin authentication (JWT)
│   │   │   ├── content.ts       # CMS content CRUD
│   │   │   └── users.ts         # User management
│   │   ├── middleware/
│   │   └── index.ts
│   └── Dockerfile
└── db/                # PostgreSQL
    └── init.sql
```

### Services (Docker Compose)

| Service    | Port  | Description                       |
|------------|-------|-----------------------------------|
| `frontend` | 3000  | React/Vite dev server             |
| `backend`  | 4000  | Express API                       |
| `db`       | 5432  | PostgreSQL database               |

### Authentication

- JWT-based authentication for the admin area
- Bcrypt password hashing
- Admin users stored in the database
- Roles: `superadmin` and `admin`

## CMS / Admin Area

Accessible at `/admin` (link in footer). Features:

- **Login** — Secure login for authorised admins
- **Content editor** — Edit text content for all landing page sections (Swedish + English)
- **User management** — Create, edit, delete admin users
- **Events & Calendar** (future) — Create/edit/delete events shown on the public site

## i18n Strategy

- All user-facing strings stored in JSON translation files
- `sv` (Swedish) is the default language
- `en` (English) is the secondary language
- Language toggle visible in the footer
- Admin area in English only (MVP)
