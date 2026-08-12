// Strips HTML and estimates reading time at 200 words/minute, rounded up to at least 1.
export function calculateReadingTime(html: string | null, wordsPerMinute = 200): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.round(words.length / wordsPerMinute));
}
