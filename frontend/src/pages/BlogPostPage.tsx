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
  external_url: string | null;
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
    fetch(`/cms/items/posts?filter[language][_eq]=${lang}&filter[status][_eq]=published&sort=-published_at&fields=slug,title,published_at,external_url`)
      .then(r => r.json())
      .then(d => setSiblings((d.data ?? []).filter((p: PostSummary) => !p.external_url)))
      .catch(() => setSiblings([]));
  }, [lang]);

  // Prefer the row matching the current language; fall back to whichever exists.
  const post = rows?.find(r => r.language === lang) ?? rows?.[0] ?? null;

  useEffect(() => {
    if (post) document.title = `${post.title} | Livslust`;
  }, [post]);

  // External-link posts have no internal article page — send readers straight to the source.
  useEffect(() => {
    if (post?.external_url) window.location.replace(post.external_url);
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

  if (post.external_url) {
    return (
      <div className="bp">
        <BlogHeader />
        <p className="bp-loading">{isEn ? 'Redirecting…' : 'Omdirigerar…'}</p>
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
