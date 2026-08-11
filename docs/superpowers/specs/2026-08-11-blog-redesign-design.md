# Blog / News Redesign — Design Spec

Date: 2026-08-11
Status: Approved by user, pending spec review

## Problem

The "Nyheter" (news) section on the Livslust homepage is well-liked as-is, but
clicking a post opens a modal: there is no dedicated, shareable URL for an
individual article, and the subpage experience (reading a full article) is
not well designed. Inspiration is drawn from the `dancing_salamanders_website_v2`
project's blog, specifically:

1. Direct URL links to individual blog posts (e.g. `/blog/some-post`).
2. A more polished editorial design for the article page (serif headline,
   date + reading time meta, prev/next navigation).

The Directus CMS backing the `posts` collection is a good foundation for this;
this spec builds on it rather than replacing it.

## Goals

- Give every post a real, shareable URL.
- Add a dedicated post detail page with an editorial design.
- Add a `/blog` index page listing all published posts.
- Keep the homepage carousel section exactly as liked today, just wired to
  navigate to real pages instead of opening a modal.
- Let editors add a slug and upload post images directly in Directus, removing
  a developer-only step for new posts.

## Non-goals

- No tags/categories (YAGNI for this round — current posts have none).
- No move to a server-rendered framework (stays a Vite + React SPA). This
  means social-media link-preview crawlers won't see per-post `<title>`/OG
  meta (they don't execute JS) — an accepted, existing limitation. We still
  set `document.title` client-side for tab-title/bookmark UX.
- No change to the existing i18n architecture (client-only `i18next` state,
  no URL language segment, defaults to `sv` on fresh load). The blog feature
  is designed to work within this constraint, not to fix it.
- No migration of the existing seeded post images (currently referenced via
  `image_key`/`IMAGE_MAP`) into Directus file storage — they keep using the
  legacy static-import path.
- No application- or database-level enforcement of the slug-pairing
  convention (same slug across a post's sv/en rows). It's a documented
  editorial convention only — YAGNI, given the small trusted editor team
  using Directus's own admin UI. If duplicate/inconsistent slugs become a
  real problem later, enforcement can be added then.

## Architecture

### Routes (frontend)

Add to [frontend/src/main.tsx](../../frontend/src/main.tsx):

- `/blog` — index page: grid of all published posts in the current UI
  language.
- `/blog/:slug` — single post page.

### Directus schema changes (`posts` collection)

Applied idempotently via `ensureField` in
[directus/seed.mjs](../../directus/seed.mjs), matching the existing pattern
used for other collections/fields:

- **`slug`** (string, required, width half). Editor-set per post. Convention:
  the Swedish and English rows representing "the same" post **share the same
  slug value**, because the post URL does not encode language (language is
  pure client state, confirmed in
  [frontend/src/i18n/index.ts](../../frontend/src/i18n/index.ts) and
  [frontend/src/components/Header.tsx](../../frontend/src/components/Header.tsx)
  — `i18n.changeLanguage`, no route segment). This pairing is a documented
  editorial convention (see Non-goals) rather than a database constraint —
  a plain `unique(slug)` constraint must **not** be added, since that would
  block the intentional sv/en pairing.
- **`image`** (uuid, `file-image` interface, relation to `directus_files`).
  Real Directus-hosted image upload, replacing the current requirement that a
  developer add a file under `frontend/src/images` and register it in
  `IMAGE_MAP` (in [frontend/src/components/News.tsx](../../frontend/src/components/News.tsx))
  for every new post. `image_key` / `image_alt` remain as a legacy fallback
  path (see Non-goals) — frontend code prefers `image` when present, else
  falls back to resolving `image_key` through `IMAGE_MAP`.
- New public **read** permission on `directus_files` (required so uploaded
  images can be fetched by anonymous visitors via the `/cms/assets/:id`
  endpoint, mirroring the existing `ensurePublicPermission(token, 'posts',
  'read')` pattern).
- `SEED_POSTS` in `seed.mjs` currently has 2 unique demo posts, each seeded
  as one sv row + one en row (4 rows total). Each gets a `slug` value added,
  shared across its sv/en pair. For example, the sv and en rows of the first
  post ("Vi startar Livslust och hållbart stöd" / "Starting Livslust och
  hållbart stöd") both get the slug `vi-startar-livslust`; the sv and en
  rows of the second post both get `var-webbplats-ar-har`.

### Fetching a post by slug

Query **without** a language filter first:

```
GET /cms/items/posts?filter[slug][_eq]=<slug>&filter[status][_eq]=published&fields=*,image.*
```

Then, client-side:
1. Prefer the row matching the current UI language.
2. If that language's row is missing, fall back to the other language's row
   (better to show a translation than a dead link).
3. If no row matches the slug at all, render a "not found" state.

Always filter `status=published` in this query (not just the list query) so
guessing a draft's slug never exposes unpublished content.

### Components

- **`PostCard`** (new: `frontend/src/components/PostCard.tsx` + CSS) —
  extracted shared card component, restyled to the editorial direction
  (serif title, date, reading time). Used by both the homepage carousel and
  the `/blog` index grid, so the two stay visually identical without
  duplicated JSX.
- **`News.tsx`** (homepage section) — structurally unchanged (carousel,
  arrows, dots), but:
  - Renders `PostCard` instead of inline card markup.
  - "Läs mer" is a real `<Link to={`/blog/${post.slug}`}>` instead of opening
    a modal.
  - The modal (`modalPost` state, `.news-modal*` CSS, close button, etc.) is
    deleted entirely.
  - A new "Se alla nyheter →" link is added at the bottom of the section,
    pointing to `/blog`.
- **`BlogIndexPage`** (new: `frontend/src/pages/BlogIndexPage.tsx` + CSS) —
  grid of `PostCard`s for all published posts in the current language; empty
  state if there are none. Sets `document.title` to "Nyheter | Livslust" /
  "News | Livslust" (matching current UI language) on mount.
- **`BlogPostPage`** (new: `frontend/src/pages/BlogPostPage.tsx` + CSS) — the
  approved "editorial style" layout:
  - Hero image strip (if an image is present).
  - Date + reading-time meta row.
  - Serif headline, thin accent-color divider.
  - Rich-text body (rendered HTML from Directus, same
    `dangerouslySetInnerHTML` approach already used in `News.tsx`).
  - Prev/next post navigation footer: "prev" is the next-older post, "next"
    is the next-newer post, both within the same language, ordered by
    `published_at` descending — matching the existing `sort=-published_at`
    already used for the list query in `News.tsx`.
  - "← Alla nyheter" link back to `/blog`.
  - Sets `document.title` to the post's title on mount.
- **Reading time** — computed client-side: strip HTML tags from the body,
  count words, divide by 200 wpm. No schema change needed.

### Subpage chrome

Following the existing precedent in
[frontend/src/pages/ResourcesPage.tsx](../../frontend/src/pages/ResourcesPage.tsx)
— **not** the full anchor-based `Header` component, since its nav links
(`#about`, `#offer`, etc.) are homepage-only anchors that would silently fail
to do anything useful on another route. Both `BlogIndexPage` and
`BlogPostPage` get:
- A light custom header: logo linking home, a "back" link that navigates to
  `/` and lands on the homepage news section (via the existing `#news`
  anchor id already present on that section), and a language toggle (needed
  here, unlike `ResourcesPage`, because posts are bilingual and a reader
  should be able to switch to the other language of the same article).
- The existing `Footer` component (safe to reuse anywhere — no anchor links).

## Error handling

- Unknown/mistyped slug → "Inlägget hittades inte" / "Post not found"
  message with a link back to `/blog`. No hard crash or blank page.
- Draft posts are never reachable by slug (see fetch filter above).
- Network/fetch failures degrade to the existing empty-state pattern already
  used in `News.tsx` (empty array, no thrown error surfaced to the user).
- Toggling language on a post page whose other-language row isn't published
  yet: since the fetch-by-slug query already returns whichever rows exist,
  the language toggle simply re-runs language selection against the
  already-fetched rows — if only one language exists, staying on it (rather
  than switching to a blank page) is the correct behavior, so the toggle has
  no visible effect until a translation is published. No separate "not
  translated" message is needed for this edge case.

## Editorial workflow docs

Update [docs/lagg-till-artiklar.md](../lagg-till-artiklar.md) (Swedish editor
guide) to cover:
- The new **Slug** field, with the "same slug for the sv and en version of a
  post" convention explained with an example.
- The new **Image** upload field (drag/drop in Directus), replacing the old
  developer-only step for new posts. Note that `image_key` still works for
  older posts but new posts should use the upload field.
- A note that every post now has its own public URL, useful for sharing.

## Testing

- Extend Playwright coverage (pattern from
  [tests/map.spec.js](../../tests/map.spec.js)) with a new spec covering:
  homepage card click → lands on `/blog/:slug` with matching title; `/blog`
  index lists posts; direct navigation to a `/blog/:slug` URL works (SPA
  fallback via nginx `try_files`); an unknown slug shows the not-found state.
- No unit-test framework exists for the Express backend or Directus schema
  today; schema changes continue to be verified by re-running `seed.mjs`
  idempotently (existing pattern — it logs `↩ already exists` vs `✓
  created`).

## Summary of files touched

- `directus/seed.mjs` — add `posts.slug`, `posts.image` fields; add
  `directus_files` public read permission; add slugs to `SEED_POSTS`.
- `frontend/src/main.tsx` — add `/blog` and `/blog/:slug` routes.
- `frontend/src/components/PostCard.tsx` + `.css` — new, shared card.
- `frontend/src/components/News.tsx` + `.css` — simplified, modal removed,
  uses `PostCard`, adds "Se alla nyheter" link.
- `frontend/src/pages/BlogIndexPage.tsx` + `.css` — new.
- `frontend/src/pages/BlogPostPage.tsx` + `.css` — new.
- `docs/lagg-till-artiklar.md` — updated editor guide.
- `tests/` — new Playwright spec for the blog flow.
