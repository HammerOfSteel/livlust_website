// Post-build step: writes a static /blog/<slug>/index.html for every
// published post, with Open Graph / Twitter Card meta tags baked in so
// social platforms (Facebook, Instagram, Slack, etc.) show a rich preview
// when the URL is shared. Nginx's `try_files $uri $uri/ /index.html` will
// serve this file for the directory before falling back to the SPA shell,
// and the file still boots the same JS bundle so real visitors get the
// normal React app.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

const CMS_URL = process.env.VITE_CMS_URL ?? 'https://livslusths.se/cms';
const SITE_URL = CMS_URL.replace(/\/cms\/?$/, '');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveImageUrl(post) {
  if (post.image?.id) return `${SITE_URL}/cms/assets/${post.image.id}`;
  if (post.image_key) return `${SITE_URL}/blog-images/${post.image_key.trim()}`;
  return null;
}

async function main() {
  let posts;
  try {
    const res = await fetch(
      `${CMS_URL}/items/posts?filter[status][_eq]=published&fields=slug,language,title,excerpt,image.id,image_key,external_url`
    );
    if (!res.ok) throw new Error(`CMS responded with ${res.status}`);
    posts = (await res.json()).data ?? [];
  } catch (err) {
    console.warn(`[generate-blog-og] Skipping: could not fetch posts (${err.message})`);
    return;
  }

  // External-link posts have no internal /blog/<slug> page — they open the source URL directly.
  posts = posts.filter(post => !post.external_url);

  const bySlug = new Map();
  for (const post of posts) {
    const existing = bySlug.get(post.slug);
    if (!existing || post.language === 'sv') bySlug.set(post.slug, post);
  }

  const template = await readFile(path.join(distDir, 'index.html'), 'utf-8');

  for (const post of bySlug.values()) {
    const url = `${SITE_URL}/blog/${post.slug}`;
    const title = escapeHtml(post.title);
    const description = escapeHtml(post.excerpt ?? '');
    const image = resolveImageUrl(post);

    const metaTags = [
      `<meta property="og:type" content="article">`,
      `<meta property="og:site_name" content="Livslust och hållbart stöd">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:url" content="${url}">`,
      image ? `<meta property="og:image" content="${image}">` : '',
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${description}">`,
      image ? `<meta name="twitter:image" content="${image}">` : '',
      `<meta name="description" content="${description}">`,
    ].filter(Boolean).join('\n    ');

    const html = template
      .replace(/<title>.*?<\/title>/, `<title>${title} | Livslust</title>`)
      .replace('</head>', `    ${metaTags}\n  </head>`);

    const outDir = path.join(distDir, 'blog', post.slug);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8');
  }

  console.log(`[generate-blog-og] Wrote OG pages for ${bySlug.size} post(s).`);
}

main();
