import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dawnArticleImg from '../images/dawn_article.jpg';
import websiteArticleImg from '../images/website_article.jpg';
import heaveAHeartImg from '../images/heave_a_heart_article.jpg';
import hero7Img from '../images/hero7.jpg';
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

const IMAGE_MAP: Record<string, string> = {
  'dawn_article.jpg':          dawnArticleImg,
  'website_article.jpg':       websiteArticleImg,
  'heave_a_heart_article.jpg': heaveAHeartImg,
  'hero7.jpg':                 hero7Img,
};

function getImage(key: string | null): string | null {
  if (!key) return null;
  return IMAGE_MAP[key.trim()] ?? null;
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

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalPost, setModalPost] = useState<Post | null>(null);

  useEffect(() => {
    setLoading(true);
    setCurrentIndex(0);
    fetch(
      `/cms/items/posts?filter[language][_eq]=${lang}&filter[status][_eq]=published&sort=-published_at&fields=*`
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
              {visiblePosts.map(post => {
                const img = getImage(post.image_key);
                return (
                  <article key={post.id} className="news-card">
                    {img && (
                      <div className="news-card-image-wrap">
                        <img
                          src={img}
                          alt={post.image_alt ?? ''}
                          className="news-card-image"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="news-card-body">
                      <time className="news-card-date" dateTime={post.published_at}>
                        {formatPublishedDate(post.published_at, lang)}
                      </time>
                      <h3 className="news-card-title">{post.title}</h3>

                      {post.excerpt && (
                        <p className="news-card-excerpt">{post.excerpt}</p>
                      )}

                      <button
                        className="news-read-btn"
                        onClick={() => setModalPost(post)}
                      >
                        {isEn ? 'Read more' : 'Läs mer'}
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
      </div>

      {/* Modal */}
      {modalPost && (
        <div className="news-modal-overlay" onClick={() => setModalPost(null)}>
          <div className="news-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="news-modal-close"
              onClick={() => setModalPost(null)}
              aria-label={isEn ? 'Close' : 'Stäng'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="news-modal-content">
              {getImage(modalPost.image_key) && (
                <img
                  src={getImage(modalPost.image_key)!}
                  alt={modalPost.image_alt ?? ''}
                  className="news-modal-image"
                />
              )}

              <time className="news-modal-date" dateTime={modalPost.published_at}>
                {formatPublishedDate(modalPost.published_at, lang)}
              </time>

              <h2 className="news-modal-title">{modalPost.title}</h2>

              {modalPost.body && (
                <div
                  className="news-modal-body"
                  dangerouslySetInnerHTML={{ __html: modalPost.body }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
