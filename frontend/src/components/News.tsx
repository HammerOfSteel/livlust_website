import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PostCard from './PostCard';
import NewsletterSignup from './NewsletterSignup';
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

        <NewsletterSignup />
      </div>
    </section>
  );
}
