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
