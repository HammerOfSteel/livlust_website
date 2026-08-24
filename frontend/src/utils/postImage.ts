import dawnArticleImg from '../images/dawn_article.jpg';
import websiteArticleImg from '../images/website_article.jpg';
import heaveAHeartImg from '../images/heave_a_heart_article.jpg';
import hero7Img from '../images/hero7.jpg';
import walkAndTalkImg from '../images/walk_and_talk.jpg';
import type { Post } from '../types/post';

const LEGACY_IMAGE_MAP: Record<string, string> = {
  'dawn_article.jpg':          dawnArticleImg,
  'website_article.jpg':       websiteArticleImg,
  'heave_a_heart_article.jpg': heaveAHeartImg,
  'hero7.jpg':                 hero7Img,
  'walk_and_talk.jpg':         walkAndTalkImg,
};

// Prefers a real Directus-hosted upload; falls back to the legacy
// image_key → static-import map used by posts seeded before the upload
// field existed; finally falls back to a hotlinked external image (used
// for external_url link-posts whose og:image was fetched automatically).
export function getPostImageUrl(post: Pick<Post, 'image' | 'image_key' | 'external_image_url'>): string | null {
  if (post.image?.id) return `/cms/assets/${post.image.id}`;
  if (post.image_key) return LEGACY_IMAGE_MAP[post.image_key.trim()] ?? null;
  if (post.external_image_url) return post.external_image_url;
  return null;
}
