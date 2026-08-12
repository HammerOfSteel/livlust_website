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
