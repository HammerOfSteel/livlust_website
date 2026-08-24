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
  external_url: string | null;
  external_image_url: string | null;
}
