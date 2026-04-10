import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './News.css';

interface Post {
  id: number;
  title: string;
  excerpt: string | null;
  body: string | null;
  published_at: string;
  image_key: string | null;
  image_alt: string | null;
}

// Eagerly import all article images so Vite bundles them
const articleImages = import.meta.glob('../images/*_article.jpg', { eager: true }) as Record<string, { default: string }>;

function getImage(key: string | null): string | null {
  if (!key) return null;
  const match = Object.entries(articleImages).find(([path]) => path.endsWith(key));
  return match ? match[1].default : null;
}

function formatPublishedDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function News() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang  = isEn ? 'en' : 'sv';

  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setExpanded(null);
    fetch(
      `/cms/items/posts?filter[language][_eq]=${lang}&filter[status][_eq]=published&sort=-published_at&fields=*`
    )
      .then(r => r.json())
      .then(d => setPosts(d.data ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [lang]);

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
          <div className="news-grid">
            {posts.map(post => {
              const img = getImage(post.image_key);
              const isOpen = expanded === post.id;
              return (
                <article key={post.id} className={`news-card${isOpen ? ' is-open' : ''}`}>
                  <div className="news-card-body">
                    <time className="news-card-date" dateTime={post.published_at}>
                      {formatPublishedDate(post.published_at, lang)}
                    </time>
                    <h3 className="news-card-title">{post.title}</h3>

                    {/* Excerpt — shown only when collapsed */}
                    {post.excerpt && !isOpen && (
                      <p className="news-card-excerpt">{post.excerpt}</p>
                    )}

                    {/* Featured image + full body — shown when expanded */}
                    {isOpen && (
                      <>
                        {img && (
                          <div className="news-card-image-wrap">
                            <img
                              src={img}
                              alt={post.image_alt ?? ''}
                              className="news-card-image"
                            />
                          </div>
                        )}
                        {post.body && (
                          <div
                            className="news-card-full-body"
                            dangerouslySetInnerHTML={{ __html: post.body }}
                          />
                        )}
                      </>
                    )}

                    <button
                      className="news-read-btn"
                      onClick={() => setExpanded(isOpen ? null : post.id)}
                      aria-expanded={isOpen}
                    >
                      {isOpen
                        ? (isEn ? 'Show less' : 'Visa mindre')
                        : (isEn ? 'Read more' : 'Läs mer')}
                      <svg
                        className="news-read-btn-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
