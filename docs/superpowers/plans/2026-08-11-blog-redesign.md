# Blog / News Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Directus `posts` entry a real, shareable URL (`/blog/:slug`) with an editorial-style detail page and a `/blog` index page, replacing the current homepage modal, while keeping the homepage "Nyheter" carousel section itself unchanged in structure.

**Architecture:** Vite + React SPA (react-router-dom, client-only i18next — no URL language segment). Directus (headless CMS) gains a `slug` field (shared across a post's sv/en row pair by editorial convention) and a real file-upload `image` field. Frontend adds two new routes/pages (`BlogIndexPage`, `BlogPostPage`), a shared `PostCard` component used by both the homepage carousel and the index page, and a shared `BlogHeader` subpage-chrome component following the existing `ResourcesPage.tsx` precedent (light custom header, not the full anchor-based `Header`).

**Tech Stack:** React 18, TypeScript, react-router-dom v6, react-i18next, Directus 10.13, Express/Postgres (unaffected by this feature), Playwright (e2e only — there is no frontend unit-test framework in this repo; verification for component-level tasks uses `tsc`/`vite build` plus manual browser checks, matching existing project convention. Do not add a new test framework as part of this plan — that would be scope creep).

**Spec:** [docs/superpowers/specs/2026-08-11-blog-redesign-design.md](../specs/2026-08-11-blog-redesign-design.md)

---

## Chunk 1: Directus schema (slug + image fields) and editor docs

### Task 1.1: Add the `slug` field to the `posts` collection

**Files:**
- Modify: `directus/seed.mjs`

- [ ] **Step 1: Insert the `slug` field definition**

In `directus/seed.mjs`, find the `ensureField(token, 'posts', { field: 'title', ...})` call (inside the `console.log('\n🔧 Fields — posts…');` block) and insert a new `slug` field definition immediately after it, before the `excerpt` field:

```js
  await ensureField(token, 'posts', {
    field: 'title', type: 'string',
    meta: { interface: 'input', width: 'full', required: true },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'posts', {
    field: 'slug', type: 'string',
    meta: {
      interface: 'input', width: 'half', required: true,
      note: 'URL-vänlig identifierare, t.ex. "vi-startar-livslust". Använd SAMMA slug för både den svenska och engelska versionen av samma inlägg, så att länken fungerar oavsett språk.',
    },
    schema: { is_nullable: false, max_length: 255 },
  });
  await ensureField(token, 'posts', {
    field: 'excerpt', type: 'string',
```

- [ ] **Step 2: Verify no syntax errors**

Run: `node --check directus/seed.mjs`
Expected: no output (exit code 0)

### Task 1.2: Add the `image` file-upload field to the `posts` collection

**Files:**
- Modify: `directus/seed.mjs`

- [ ] **Step 1: Insert the `image` field definition**

Immediately after the existing `image_alt` field's `ensureField` call (the last field in the `posts` block), add:

```js
  await ensureField(token, 'posts', {
    field: 'image_alt', type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Beskrivning av bilden för skärmläsare (alt-text)' },
    schema: { is_nullable: true, max_length: 255 },
  });
  await ensureField(token, 'posts', {
    field: 'image', type: 'uuid',
    meta: {
      interface: 'file-image', width: 'half', special: ['file'],
      note: 'Ladda upp en bild för artikeln. Ersätter "image_key" för nya inlägg — äldre inlägg kan fortsätta använda image_key.',
    },
    schema: {
      is_nullable: true,
      foreign_key_table: 'directus_files',
      foreign_key_column: 'id',
    },
  });
```

- [ ] **Step 2: Verify no syntax errors**

Run: `node --check directus/seed.mjs`
Expected: no output (exit code 0)

### Task 1.3: Grant public read access to `directus_files`

**Files:**
- Modify: `directus/seed.mjs`

- [ ] **Step 1: Add the permission call**

Find `await ensurePublicPermission(token, 'posts', 'read');` in the `main()` function's `🔐 Public permissions…` block and add a line right after it:

```js
  await ensurePublicPermission(token, 'posts', 'read');
  await ensurePublicPermission(token, 'directus_files', 'read');
```

This lets anonymous visitors load uploaded post images via `/cms/assets/:id` (mirrors how `posts` items are already public-readable).

### Task 1.4: Add `slug` values to the seeded demo posts

**Files:**
- Modify: `directus/seed.mjs`

- [ ] **Step 1: Add `slug` to each of the 4 `SEED_POSTS` entries**

`SEED_POSTS` has 2 unique posts, each seeded as one `sv` row + one `en` row (4 rows total). Add a `slug` key to each object — the sv/en pair for the same post must use the **same** slug value:

```js
const SEED_POSTS = [
  {
    status: 'published',
    language: 'sv',
    slug: 'vi-startar-livslust',
    published_at: '2026-04-01',
    title: 'Vi startar Livslust och hållbart stöd',
    // ...existing fields unchanged...
  },
  {
    status: 'published',
    language: 'en',
    slug: 'vi-startar-livslust',
    published_at: '2026-04-01',
    title: 'Starting Livslust och hållbart stöd',
    // ...existing fields unchanged...
  },
  {
    status: 'published',
    language: 'sv',
    slug: 'var-webbplats-ar-har',
    published_at: '2026-04-10',
    title: 'Vår webbplats är här, och vår Discord öppnar snart',
    // ...existing fields unchanged...
  },
  {
    status: 'published',
    language: 'en',
    slug: 'var-webbplats-ar-har',
    published_at: '2026-04-10',
    title: 'Our website is here, and our Discord opens soon',
    // ...existing fields unchanged...
  },
];
```

Only add the `slug: '...'` line to each of the 4 objects — do not change any other existing field.

- [ ] **Step 2: Verify no syntax errors**

Run: `node --check directus/seed.mjs`
Expected: no output (exit code 0)

### Task 1.5: Apply and verify the schema changes against a running stack

**Files:** none (verification only)

- [ ] **Step 1: Start the database and Directus (without wiping existing data)**

Run: `docker-compose up -d db directus`
Expected: both containers report healthy/running (`docker-compose ps`)

- [ ] **Step 2: Re-run the seed script**

Run: `docker-compose run --rm directus-init`
Expected output includes (order may vary):
```
  ✓ Created field 'posts.slug'.
  ✓ Created field 'posts.image'.
  ✓ Public read on 'directus_files'.
```
If a field already exists from a previous partial run, you'll instead see `↩ Field 'posts.slug' already exists.` — that's fine, the script is idempotent.

- [ ] **Step 3: Verify the `image` field behaves as an image upload widget**

Open `http://localhost:8055/admin`, log in, go to **Content → Posts**, open any post, and confirm there is an **Image** field that lets you upload/select a file (not a plain text box).

**If it does not render as an image picker:** the field's `special`/`schema.foreign_key_*` shape may not match what this Directus version (10.13.3) expects for a M2O-to-files relation created purely via the Fields API. In that case, delete the `image` field in the admin UI, recreate it via **Settings → Data Model → Posts → Create Field → Image**, then run `GET /fields/posts/image` (with an admin auth token) to see the actual `meta`/`schema` Directus generated, and update the `ensureField` call in `seed.mjs` to match that shape exactly, so re-running the seed script stays idempotent and reproducible for other environments.

- [ ] **Step 4: Verify the seeded slugs are publicly readable**

Run: `curl -s 'http://localhost:8055/items/posts?filter[language][_eq]=sv&fields=slug,title&sort=-published_at' | head -c 500`
Expected: JSON containing `"slug":"var-webbplats-ar-har"` and `"slug":"vi-startar-livslust"` among the results.

- [ ] **Step 5: Commit**

```bash
git add directus/seed.mjs
git commit -m "feat(cms): add slug and image fields to posts collection"
```

### Task 1.6: Update the editor guide

**Files:**
- Modify: `docs/lagg-till-artiklar.md`

- [ ] **Step 1: Add the Slug field to the field table**

Find the Markdown table under `### 3. Fyll i fälten` and add a row for **Slug** right after **Titel**:

```markdown
| **Titel** | Rubriken på artikeln | Ny samtalsgrupp startar i höst |
| **Slug** | Del av webbadressen till inlägget. **Använd samma slug för den svenska och den engelska versionen av samma inlägg**, annars fungerar inte språkväxlingen på artikelsidan. Använd bara små bokstäver, siffror och bindestreck. | ny-samtalsgrupp-hostenmark |
| **Brödtext** | Artiklens innehåll. Du kan använda radbrytningar för stycken | Från september startar vi... |
```

(Use a real, plausible slug example instead of `ny-samtalsgrupp-hostenmark` if you prefer — the key content is the "same slug for both languages" instruction.)

- [ ] **Step 2: Document the new Image field**

Add a new row to the same table, after **Brödtext**:

```markdown
| **Bild** | Ladda upp en bild till artikeln genom att klicka i fältet och välja en fil. Valfritt. | (ladda upp en JPG/PNG) |
```

- [ ] **Step 3: Remove the outdated "planned as a next step" notice**

Find this line near the top of the file and delete it (the feature described below it is now live, not planned):

```markdown
> **Notera:** Nyhetsektionen är planerad som ett nästa steg. När den är på plats hittar du samlingen i menyn under **"Posts"** eller **"Inlägg"**.
```

- [ ] **Step 4: Add a note about direct post URLs**

At the end of the `## Tips för bra texter` section, add:

```markdown
## Dela ett inlägg

Varje publicerat inlägg får nu en egen webbadress, t.ex.
`https://livslusths.se/blog/ny-samtalsgrupp-hostenmark`. Du kan dela den
länken direkt på sociala medier eller i andra kanaler.
```

- [ ] **Step 5: Commit**

```bash
git add docs/lagg-till-artiklar.md
git commit -m "docs: update editor guide for slug and image fields"
```

---

## Chunk 2: Shared frontend utilities, types, `BlogHeader`, and `BlogPostPage`

### Task 2.1: Add the shared `Post` type

**Files:**
- Create: `frontend/src/types/post.ts`

- [ ] **Step 1: Create the file**

```ts
export interface Post {
  id: number;
  slug: string;
  language: 'sv' | 'en';
  status: 'published' | 'draft';
  title: string;
  excerpt: string | null;
  body: string | null;
  published_at: string;
  image: { id: string } | null;
  image_key: string | null;
  image_alt: string | null;
}
```

- [ ] **Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors (existing `News.tsx` doesn't import this yet, so this step just confirms the file itself is syntactically valid TypeScript)

### Task 2.2: Add the shared post-image resolver util

**Files:**
- Create: `frontend/src/utils/postImage.ts`

- [ ] **Step 1: Create the file**

```ts
import dawnArticleImg from '../images/dawn_article.jpg';
import websiteArticleImg from '../images/website_article.jpg';
import heaveAHeartImg from '../images/heave_a_heart_article.jpg';
import hero7Img from '../images/hero7.jpg';
import type { Post } from '../types/post';

const LEGACY_IMAGE_MAP: Record<string, string> = {
  'dawn_article.jpg':          dawnArticleImg,
  'website_article.jpg':       websiteArticleImg,
  'heave_a_heart_article.jpg': heaveAHeartImg,
  'hero7.jpg':                 hero7Img,
};

// Prefers a real Directus-hosted upload; falls back to the legacy
// image_key → static-import map used by posts seeded before the upload
// field existed.
export function getPostImageUrl(post: Pick<Post, 'image' | 'image_key'>): string | null {
  if (post.image?.id) return `/cms/assets/${post.image.id}`;
  if (post.image_key) return LEGACY_IMAGE_MAP[post.image_key.trim()] ?? null;
  return null;
}
```

- [ ] **Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors

### Task 2.3: Add the shared published-date formatter util

**Files:**
- Create: `frontend/src/utils/dateFormat.ts`

- [ ] **Step 1: Create the file**

Extracted from the `formatPublishedDate` function duplicated in the current `News.tsx`, so `BlogPostPage` and (in Chunk 3) `PostCard` share one implementation instead of three copies:

```ts
export function formatPublishedDate(dateStr: string, lang: 'sv' | 'en'): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}
```

- [ ] **Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors

### Task 2.4: Add the reading-time util

**Files:**
- Create: `frontend/src/utils/readingTime.ts`

- [ ] **Step 1: Create the file**

```ts
// Strips HTML and estimates reading time at 200 words/minute, rounded up to at least 1.
export function calculateReadingTime(html: string | null, wordsPerMinute = 200): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.round(words.length / wordsPerMinute));
}
```

- [ ] **Step 2: Verify with a manual sanity check**

Run: `cd frontend && node -e "
const fn = require('fs').readFileSync('src/utils/readingTime.ts', 'utf8');
console.log(fn.includes('wordsPerMinute') ? 'ok' : 'FAIL');
"`
Expected: `ok`

(This project has no unit-test runner; this is a lightweight existence check. Full behavioral verification happens visually in Task 2.7's manual check, where a real post's reading time is displayed on the page.)

### Task 2.5: Add the shared `BlogHeader` component

**Files:**
- Create: `frontend/src/components/BlogHeader.tsx`
- Create: `frontend/src/components/BlogHeader.css`

- [ ] **Step 1: Create `BlogHeader.tsx`**

Following the existing precedent in `frontend/src/pages/ResourcesPage.tsx` (plain `<a>` tags, not router `Link`, so navigating back to `/` triggers a real page load and the browser's native hash-scroll takes over for `/#news`):

```tsx
import { useTranslation } from 'react-i18next';
import './BlogHeader.css';

export default function BlogHeader() {
  const { i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'sv' ? 'en' : 'sv');

  return (
    <header className="blog-header">
      <a className="blog-header__back" href="/#news">
        {i18n.language === 'en' ? '← Back' : '← Tillbaka'}
      </a>
      <a className="blog-header__logo" href="/">Livslust</a>
      <button
        className="blog-header__lang"
        onClick={toggleLang}
        aria-label={`Byt språk till ${i18n.language === 'sv' ? 'English' : 'Svenska'}`}
      >
        {i18n.language === 'sv' ? 'EN' : 'SV'}
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Create `BlogHeader.css`**

Mirrors `ResourcesPage.css`'s `.rp-header` styling:

```css
.blog-header {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 1.5rem;
  background: var(--color-primary);
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.blog-header__back {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  white-space: nowrap;
}

.blog-header__back:hover { color: #fff; }

.blog-header__logo {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  flex: 1;
}

.blog-header__lang {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
}

.blog-header__lang:hover { background: rgba(255,255,255,0.25); }
```

- [ ] **Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors

### Task 2.6: Add a global serif font token for editorial headings

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Add `--font-serif` next to the existing `--font-sans`**

```css
:root {
  --font-sans: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-serif: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
  --radius: 10px;
  --max-w: 920px;
  --shadow: 0 2px 16px rgba(0,0,0,0.07);
}
```

- [ ] **Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors (CSS isn't type-checked, this just confirms nothing else broke)

### Task 2.7: Add the `BlogPostPage`

**Files:**
- Create: `frontend/src/pages/BlogPostPage.tsx`
- Create: `frontend/src/pages/BlogPostPage.css`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create `BlogPostPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BlogHeader from '../components/BlogHeader';
import Footer from '../components/Footer';
import { getPostImageUrl } from '../utils/postImage';
import { calculateReadingTime } from '../utils/readingTime';
import { formatPublishedDate } from '../utils/dateFormat';
import type { Post } from '../types/post';
import './BlogPostPage.css';

interface PostSummary {
  slug: string;
  title: string;
  published_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang = isEn ? 'en' : 'sv';

  const [rows, setRows] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [siblings, setSiblings] = useState<PostSummary[]>([]);

  // Fetch every language row for this slug (language isn't part of the URL).
  useEffect(() => {
    setLoading(true);
    fetch(`/cms/items/posts?filter[slug][_eq]=${slug}&filter[status][_eq]=published&fields=*,image.id`)
      .then(r => r.json())
      .then(d => setRows(d.data ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch a slim, sorted list in the current language for prev/next navigation.
  useEffect(() => {
    fetch(`/cms/items/posts?filter[language][_eq]=${lang}&filter[status][_eq]=published&sort=-published_at&fields=slug,title,published_at`)
      .then(r => r.json())
      .then(d => setSiblings(d.data ?? []))
      .catch(() => setSiblings([]));
  }, [lang]);

  // Prefer the row matching the current language; fall back to whichever exists.
  const post = rows?.find(r => r.language === lang) ?? rows?.[0] ?? null;

  useEffect(() => {
    if (post) document.title = `${post.title} | Livslust`;
  }, [post]);

  if (loading) {
    return (
      <div className="bp">
        <BlogHeader />
        <p className="bp-loading">{isEn ? 'Loading…' : 'Laddar…'}</p>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bp">
        <BlogHeader />
        <div className="bp-not-found">
          <h1>{isEn ? 'Post not found' : 'Inlägget hittades inte'}</h1>
          <Link to="/blog">{isEn ? '← All posts' : '← Alla nyheter'}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const idx = siblings.findIndex(p => p.slug === post.slug);
  const prev = idx >= 0 ? siblings[idx + 1] ?? null : null; // next-older
  const next = idx >= 0 && idx > 0 ? siblings[idx - 1] ?? null : null; // next-newer
  const img = getPostImageUrl(post);
  const readingMinutes = calculateReadingTime(post.body);

  return (
    <div className="bp">
      <BlogHeader />

      {img && <div className="bp-hero" style={{ backgroundImage: `url(${img})` }} />}

      <article className="bp-article">
        <div className="bp-meta">
          <time dateTime={post.published_at}>{formatPublishedDate(post.published_at, lang)}</time>
          <span>{isEn ? `${readingMinutes} min read` : `${readingMinutes} min läsning`}</span>
        </div>
        <h1 className="bp-title">{post.title}</h1>
        <div className="bp-divider" />
        {post.body && <div className="bp-body" dangerouslySetInnerHTML={{ __html: post.body }} />}
      </article>

      {(prev || next) && (
        <nav className="bp-nav">
          {prev ? (
            <Link className="bp-nav-link bp-nav-prev" to={`/blog/${prev.slug}`}>
              <span className="bp-nav-label">← {isEn ? 'Previous' : 'Föregående'}</span>
              <span className="bp-nav-title">{prev.title}</span>
            </Link>
          ) : <span className="bp-nav-spacer" />}
          {next ? (
            <Link className="bp-nav-link bp-nav-next" to={`/blog/${next.slug}`}>
              <span className="bp-nav-label">{isEn ? 'Next' : 'Nästa'} →</span>
              <span className="bp-nav-title">{next.title}</span>
            </Link>
          ) : <span className="bp-nav-spacer" />}
        </nav>
      )}

      <div className="bp-back">
        <Link to="/blog">{isEn ? '← All posts' : '← Alla nyheter'}</Link>
      </div>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Create `BlogPostPage.css`**

```css
.bp {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.bp-loading {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-muted);
}

.bp-not-found {
  text-align: center;
  padding: 5rem 1.5rem;
}

.bp-not-found h1 {
  font-size: 1.5rem;
  color: var(--color-primary-d);
  margin-bottom: 1rem;
}

.bp-hero {
  height: 320px;
  background-size: cover;
  background-position: center;
}

@media (max-width: 768px) {
  .bp-hero { height: 200px; }
}

.bp-article {
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 1.5rem 2rem;
  flex: 1;
  width: 100%;
}

.bp-meta {
  display: flex;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-bottom: 1rem;
}

.bp-title {
  font-family: var(--font-serif);
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--color-primary-d);
  line-height: 1.3;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .bp-title { font-size: 1.6rem; }
}

.bp-divider {
  width: 48px;
  height: 3px;
  background: var(--color-accent);
  margin-bottom: 2rem;
}

.bp-body {
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--color-text);
}

.bp-body p { margin-bottom: 1.25rem; }
.bp-body h3 { font-size: 1.2rem; margin: 2rem 0 0.75rem; color: var(--color-primary); }

.bp-nav {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
  width: 100%;
  display: flex;
  gap: 1rem;
}

.bp-nav-link {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.9rem 1.1rem;
  text-decoration: none;
  transition: border-color 0.15s;
}

.bp-nav-link:hover { border-color: var(--color-primary); }

.bp-nav-next { text-align: right; }

.bp-nav-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 0.3rem;
}

.bp-nav-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary-d);
}

.bp-nav-spacer { flex: 1; }

.bp-back {
  text-align: center;
  padding-bottom: 3rem;
}
```

- [ ] **Step 3: Wire the `/blog/:slug` route**

In `frontend/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n/index';
import Home from './pages/Home';
import ResourcesPage from './pages/ResourcesPage';
import BlogPostPage from './pages/BlogPostPage';
import './index.css';

// Apply theme from env var (set data-theme on <html>)
document.documentElement.setAttribute(
  'data-theme',
  import.meta.env.VITE_THEME ?? 'ocean'
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resurskarta" element={<ResourcesPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

(The `/blog` index route is added in Chunk 3, once `BlogIndexPage` exists.)

- [ ] **Step 4: Verify with a type-check and build**

Run: `cd frontend && npx tsc --noEmit && npx vite build`
Expected: both commands exit 0 with no errors

- [ ] **Step 5: Manual verification against the running stack**

Requires `docker-compose up -d` (all services) with Chunk 1 already applied and the frontend container restarted/rebuilt to pick up new source (`docker-compose restart frontend` if using the dev volume mount, or `docker-compose up -d --build frontend`).

Visit `http://localhost:3000/blog/vi-startar-livslust` and confirm:
- The post title, date, reading time, and body render.
- The page shows a "← Alla nyheter" link back to `/blog` (won't navigate correctly yet — `/blog` is added in Chunk 3, a transient 404/blank page here is expected until then).
- Visit `http://localhost:3000/blog/does-not-exist` and confirm the "Inlägget hittades inte" message appears instead of a crash.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types/post.ts frontend/src/utils/postImage.ts frontend/src/utils/readingTime.ts frontend/src/components/BlogHeader.tsx frontend/src/components/BlogHeader.css frontend/src/index.css frontend/src/pages/BlogPostPage.tsx frontend/src/pages/BlogPostPage.css frontend/src/main.tsx
git commit -m "feat(frontend): add BlogPostPage with editorial layout at /blog/:slug"
```

---

## Chunk 3: Shared `PostCard` and `BlogIndexPage`

### Task 3.1: Add the shared `PostCard` component

**Files:**
- Create: `frontend/src/components/PostCard.tsx`
- Create: `frontend/src/components/PostCard.css`

- [ ] **Step 1: Create `PostCard.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPostImageUrl } from '../utils/postImage';
import { calculateReadingTime } from '../utils/readingTime';
import { formatPublishedDate } from '../utils/dateFormat';
import type { Post } from '../types/post';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang = isEn ? 'en' : 'sv';
  const img = getPostImageUrl(post);
  const readingMinutes = calculateReadingTime(post.body);

  return (
    <Link to={`/blog/${post.slug}`} className="post-card">
      {img && (
        <div className="post-card-image-wrap">
          <img src={img} alt={post.image_alt ?? ''} className="post-card-image" loading="lazy" />
        </div>
      )}
      <div className="post-card-body">
        <div className="post-card-meta">
          <time dateTime={post.published_at}>{formatPublishedDate(post.published_at, lang)}</time>
          <span aria-hidden="true">·</span>
          <span>{isEn ? `${readingMinutes} min read` : `${readingMinutes} min läsning`}</span>
        </div>
        <h3 className="post-card-title">{post.title}</h3>
        {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
        <span className="post-card-read-more">
          {isEn ? 'Read more' : 'Läs mer'}
          <svg
            className="post-card-read-more-icon"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create `PostCard.css`**

Adapted from the existing `.news-card*` rules in `News.css` (which will be removed from `News.css` in Chunk 4 once nothing references them), plus the serif title and meta row:

```css
.post-card {
  display: block;
  background: var(--color-card-bg);
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: calc(var(--radius) * 1.5);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.1);
  text-decoration: none;
}

.post-card-image-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.post-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}

.post-card:hover .post-card-image {
  transform: scale(1.04);
}

.post-card-body {
  padding: 1.5rem 1.75rem 1.6rem;
}

.post-card-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--color-muted);
  margin-bottom: 0.6rem;
}

.post-card-title {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary-d);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.post-card-excerpt {
  font-size: 0.95rem;
  color: var(--color-muted);
  line-height: 1.8;
  margin-bottom: 1.1rem;
}

.post-card-read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-primary);
}

.post-card:hover .post-card-read-more { color: var(--color-primary-d); }

.post-card-read-more-icon {
  width: 0.9rem;
  height: 0.9rem;
}
```

- [ ] **Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors (nothing renders `PostCard` yet — that happens in Task 3.2 and Chunk 4)

### Task 3.2: Add the `BlogIndexPage`

**Files:**
- Create: `frontend/src/pages/BlogIndexPage.tsx`
- Create: `frontend/src/pages/BlogIndexPage.css`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create `BlogIndexPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BlogHeader from '../components/BlogHeader';
import Footer from '../components/Footer';
import PostCard from '../components/PostCard';
import type { Post } from '../types/post';
import './BlogIndexPage.css';

export default function BlogIndexPage() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang = isEn ? 'en' : 'sv';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = isEn ? 'News | Livslust' : 'Nyheter | Livslust';
  }, [isEn]);

  useEffect(() => {
    setLoading(true);
    fetch(`/cms/items/posts?filter[language][_eq]=${lang}&filter[status][_eq]=published&sort=-published_at&fields=*,image.id`)
      .then(r => r.json())
      .then(d => setPosts(d.data ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <div className="bi">
      <BlogHeader />
      <div className="container bi-content">
        <h1 className="bi-heading">{isEn ? 'News' : 'Nyheter'}</h1>

        {loading && <p className="bi-loading">{isEn ? 'Loading…' : 'Laddar…'}</p>}

        {!loading && posts.length === 0 && (
          <p className="bi-empty">
            {isEn ? 'No articles yet. Check back soon!' : 'Inga artiklar ännu. Kika in snart!'}
          </p>
        )}

        {!loading && posts.length > 0 && (
          <div className="bi-grid">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Create `BlogIndexPage.css`**

```css
.bi {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.bi-content {
  flex: 1;
  padding: 3rem 1.5rem;
}

.bi-heading {
  font-family: var(--font-serif);
  font-size: 2rem;
  color: var(--color-primary-d);
  margin-bottom: 2rem;
  text-align: center;
}

.bi-loading,
.bi-empty {
  text-align: center;
  color: var(--color-muted);
  padding: 2.5rem 0;
}

.bi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  max-width: var(--max-w);
  margin: 0 auto;
}
```

- [ ] **Step 3: Wire the `/blog` route**

In `frontend/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n/index';
import Home from './pages/Home';
import ResourcesPage from './pages/ResourcesPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostPage from './pages/BlogPostPage';
import './index.css';

// Apply theme from env var (set data-theme on <html>)
document.documentElement.setAttribute(
  'data-theme',
  import.meta.env.VITE_THEME ?? 'ocean'
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resurskarta" element={<ResourcesPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 4: Verify with a type-check and build**

Run: `cd frontend && npx tsc --noEmit && npx vite build`
Expected: both commands exit 0 with no errors

- [ ] **Step 5: Manual verification against the running stack**

Visit `http://localhost:3000/blog` and confirm:
- All published posts render as cards in a grid.
- Clicking a card navigates to `/blog/:slug` and shows the matching post (this now works end-to-end since both routes exist).
- The "← Alla nyheter" link on the post page now correctly returns to `/blog`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/PostCard.tsx frontend/src/components/PostCard.css frontend/src/pages/BlogIndexPage.tsx frontend/src/pages/BlogIndexPage.css frontend/src/main.tsx
git commit -m "feat(frontend): add PostCard and BlogIndexPage at /blog"
```

---

## Chunk 4: Homepage integration, Playwright e2e coverage, and final verification

### Task 4.1: Update `News.tsx` to use `PostCard` and remove the modal

**Files:**
- Modify: `frontend/src/components/News.tsx`
- Modify: `frontend/src/components/News.css`

- [ ] **Step 1: Replace the full contents of `News.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PostCard from './PostCard';
import type { Post } from '../types/post';
import './News.css';

export default function News() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang  = isEn ? 'en' : 'sv';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setCurrentIndex(0);
    fetch(
      `/cms/items/posts?filter[language][_eq]=${lang}&filter[status][_eq]=published&sort=-published_at&fields=*,image.id`
    )
      .then(r => r.json())
      .then(d => setPosts(d.data ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [lang]);

  const cardsPerPage = 2;
  const maxIndex = Math.max(0, posts.length - cardsPerPage);

  const nextPage = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevPage = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const visiblePosts = posts.slice(currentIndex, currentIndex + cardsPerPage);

  return (
    <section id="news" className="news-section">
      <div className="container">
        <h2 className="section-heading">
          {isEn ? 'News' : 'Nyheter'}
        </h2>
        <p className="section-intro">
          {isEn
            ? 'Stories, updates and reflections from Livslust och hållbart stöd.'
            : 'Berättelser, uppdateringar och reflektioner från Livslust och hållbart stöd.'}
        </p>

        {loading && (
          <p className="news-loading">{isEn ? 'Loading…' : 'Laddar…'}</p>
        )}

        {!loading && posts.length === 0 && (
          <p className="news-empty">
            {isEn ? 'No articles yet. Check back soon!' : 'Inga artiklar ännu. Kika in snart!'}
          </p>
        )}

        {!loading && posts.length > 0 && (
          <div className="news-carousel">
            {posts.length > cardsPerPage && (
              <button
                className="carousel-arrow carousel-arrow--left"
                onClick={prevPage}
                aria-label={isEn ? 'Previous articles' : 'Föregående artiklar'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            <div className="news-grid">
              {visiblePosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {posts.length > cardsPerPage && (
              <button
                className="carousel-arrow carousel-arrow--right"
                onClick={nextPage}
                aria-label={isEn ? 'Next articles' : 'Nästa artiklar'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Pagination dots */}
        {!loading && posts.length > cardsPerPage && (
          <div className="carousel-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot${idx === currentIndex ? ' active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={isEn ? `Go to page ${idx + 1}` : `Gå till sida ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="news-see-all">
            <Link to="/blog" className="news-see-all-link">
              {isEn ? 'See all news →' : 'Se alla nyheter →'}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Remove obsolete rules and add the "see all" link style in `News.css`**

Delete every rule from `/* ── Card ─────... ──────── */` through the end of the file (all `.news-card*` and `.news-modal*` rules — these now live in `PostCard.css` or are unused), keeping everything above that point (`.news-section`, `.news-loading`/`.news-empty`, `.news-carousel`, `.news-grid` and its media query). Then add, at the end of the file:

```css
.news-see-all {
  text-align: center;
  margin-top: 1rem;
}

.news-see-all-link {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-primary);
}

.news-see-all-link:hover {
  color: var(--color-primary-d);
}
```

- [ ] **Step 3: Verify with a type-check and build**

Run: `cd frontend && npx tsc --noEmit && npx vite build`
Expected: both commands exit 0 with no errors (in particular, no "unused import" or "cannot find name `Post`" errors)

- [ ] **Step 4: Manual verification against the running stack**

Visit `http://localhost:3000/` and confirm:
- The "Nyheter" carousel section looks the same as before (arrows, dots, two cards per page).
- Clicking a card's "Läs mer" navigates to `/blog/:slug` (no modal opens).
- A "Se alla nyheter →" link appears below the carousel and navigates to `/blog`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/News.tsx frontend/src/components/News.css
git commit -m "refactor(frontend): homepage news carousel links to real post pages"
```

### Task 4.2: Add Playwright e2e coverage for the blog flow

**Files:**
- Create: `tests/blog.spec.js`
- Modify: `playwright.config.js`

- [ ] **Step 1: Add a `blog-e2e` project to `playwright.config.js`**

This project runs against the dockerized frontend (`http://localhost:3000`) instead of the POC's standalone HTTP server, and only picks up `blog.spec.js`. Restrict the existing `chromium` project to `map.spec.js` so the two suites don't collide on `baseURL`:

```js
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15_000,
  use: {
    // Serve the POC from the already-running python server
    baseURL: 'http://localhost:8765',
    // WebGL is needed for MapLibre
    launchOptions: { args: ['--enable-webgl', '--use-gl=swiftshader'] },
  },
  projects: [
    { name: 'chromium', testMatch: /map\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'blog-e2e',
      testMatch: /blog\.spec\.js/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
  ],
  // Don't start a server — user runs python3 -m http.server 8765 (for
  // `chromium`) or `docker-compose up -d` (for `blog-e2e`) separately
  webServer: {
    command: 'python3 -m http.server 8765',
    url: 'http://localhost:8765',
    reuseExistingServer: true,
    timeout: 5_000,
  },
});
```

- [ ] **Step 2: Create `tests/blog.spec.js`**

```js
// @ts-check
/**
 * Blog / news redesign — Playwright tests
 *
 * Requires the full docker-compose stack running locally beforehand:
 *   docker-compose up -d
 * (frontend on http://localhost:3000, Directus seeded with the demo posts
 * from directus/seed.mjs, including the `vi-startar-livslust` slug)
 *
 * Run with: npx playwright test --project=blog-e2e
 */
const { test, expect } = require('@playwright/test');

test.describe('Blog index page', () => {
  test('/blog lists published posts as cards linking to their own URL', async ({ page }) => {
    await page.goto('/blog');
    const cards = page.locator('.post-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });
});

test.describe('Blog post page', () => {
  test('clicking a homepage card navigates to a real /blog/:slug URL', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('#news .post-card').first();
    await expect(firstCard).toBeVisible();
    const title = (await firstCard.locator('.post-card-title').innerText()).trim();
    await firstCard.click();
    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+/);
    await expect(page.locator('.bp-title')).toHaveText(title);
  });

  test('direct navigation to a known slug works (SPA fallback)', async ({ page }) => {
    await page.goto('/blog/vi-startar-livslust');
    await expect(page.locator('.bp-title')).toBeVisible();
  });

  test('unknown slug shows a not-found state instead of crashing', async ({ page }) => {
    await page.goto('/blog/does-not-exist-xyz');
    await expect(page.getByText(/hittades inte|not found/i)).toBeVisible();
  });
});
```

- [ ] **Step 3: Run the new suite**

Requires `docker-compose up -d` already running with Chunks 1–3 applied.

Run: `npx playwright test --project=blog-e2e`
Expected: 4 passed

- [ ] **Step 4: Commit**

```bash
git add tests/blog.spec.js playwright.config.js
git commit -m "test: add Playwright coverage for the blog index and post flow"
```

### Task 4.3: Final full-project verification

**Files:** none (verification only)

- [ ] **Step 1: Full type-check and build**

Run: `cd frontend && npx tsc --noEmit && npx vite build`
Expected: both exit 0

- [ ] **Step 2: Full Playwright run**

Run: `npx playwright test`
Expected: both `chromium` (map) and `blog-e2e` projects pass

- [ ] **Step 3: Re-run the Directus seed one more time to confirm idempotency**

Run: `docker-compose run --rm directus-init`
Expected: every line reads `↩ ... already exists.` (no new `✓ Created` lines — confirms Chunk 1's schema changes are stable/idempotent)
