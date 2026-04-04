# Todo — Livslust och hållbart stöd

## MVP

### Infrastructure
- [x] README.md updated
- [x] overview.md created
- [x] todo.md created
- [ ] `docker-compose.yml` with frontend, backend, db services
- [ ] `.env.example` with required environment variables
- [ ] PostgreSQL init SQL (users, content tables)

### Frontend
- [ ] Vite + React + TypeScript scaffold
- [ ] i18n setup (react-i18next) with `sv` and `en` JSON files
- [ ] Language toggle (SV / EN) in footer
- [ ] Landing page — one-pager with sections:
  - [ ] Header / Hero (logo, name, tagline)
  - [ ] About us section
  - [ ] What we offer section
  - [ ] Contact form (sends email or stores in DB)
  - [ ] Footer (contact info, admin link, language toggle)
- [ ] Admin login page (`/admin/login`)
- [ ] Admin dashboard (protected route)
  - [ ] Edit landing page content (per section, per language)
  - [ ] User management (create / edit / delete admin users)
- [ ] Responsive design (mobile-first)
- [ ] WCAG AA accessibility baseline

### Backend
- [ ] Express + TypeScript scaffold
- [ ] JWT authentication (login, token validation middleware)
- [ ] `POST /api/auth/login` — admin login
- [ ] `GET/PUT /api/content/:section` — read and update CMS content
- [ ] `GET/POST/PUT/DELETE /api/users` — admin user management
- [ ] `POST /api/contact` — receive contact form submissions
- [ ] Bcrypt password hashing
- [ ] Input validation (zod or express-validator)

### Database
- [ ] `users` table (id, email, password_hash, role, created_at)
- [ ] `content` table (id, section, language, body, updated_at)
- [ ] `contact_submissions` table (id, name, email, message, created_at)
- [ ] Seed script — initial superadmin user

### DevOps
- [ ] Dockerfile for frontend
- [ ] Dockerfile for backend
- [ ] docker-compose.yml tying all services together
- [ ] `.gitignore` ignoring `.env`, `node_modules`, build outputs

### GitHub
- [ ] Init git repo
- [ ] Create repo on hammerofsteel GitHub via `gh` CLI
- [ ] Push initial commit

---

## Beyond MVP — Suggested Features

### Events & Calendar
- [ ] Public-facing events/calendar section on the landing page
- [ ] Admin: create, edit, delete events (title, description, date, location)
- [ ] `events` table in database
- [ ] iCal export link

### Newsletter / Mailing List
- [ ] Email sign-up form on landing page
- [ ] Admin: view and export subscribers
- [ ] Integration with a mailing provider (e.g. Mailchimp, Brevo)

### Blog / News
- [ ] Admin: write and publish news/blog posts
- [ ] Public-facing news section on the site
- [ ] Swedish + English per post

### Media & Resources
- [ ] Admin: upload documents (PDFs, guides)
- [ ] Public: downloadable resources section

### Improved Contact Flow
- [ ] Email notification to org when contact form is submitted
- [ ] Auto-reply email to sender
- [ ] Spam protection (honeypot or reCAPTCHA)

### SEO & Accessibility
- [ ] Meta tags, Open Graph, sitemap.xml, robots.txt
- [ ] Full WCAG AA audit and fixes
- [ ] Swedish-language structured data (schema.org)

### Security Hardening
- [ ] Rate limiting on login and contact endpoints
- [ ] CSRF protection
- [ ] Helmet.js HTTP security headers
- [ ] Secure cookie flags for JWT

### Analytics
- [ ] Privacy-friendly analytics (e.g. Plausible, Umami)
- [ ] Admin dashboard visit stats

### Multi-language Expansion
- [ ] Additional language support (e.g. Arabic, Somali) to serve diverse communities
