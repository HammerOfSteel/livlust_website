import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ContentMap = Record<string, string>;

// Module-level cache so we only fetch once per language per session
const cache: Record<string, ContentMap> = {};

/**
 * Fetches all page_content items for the current language from Directus.
 * Falls back silently to empty map (components fall back to i18n translations).
 */
export function useSiteContent(): ContentMap {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [content, setContent] = useState<ContentMap>(cache[lang] ?? {});

  useEffect(() => {
    if (cache[lang]) {
      setContent(cache[lang]);
      return;
    }
    fetch(
      `/cms/items/page_content?filter[language][_eq]=${lang}&fields=section,body&limit=100`
    )
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.data)) {
          const map: ContentMap = {};
          for (const item of data.data) {
            if (item.section && item.body) map[item.section] = item.body;
          }
          cache[lang] = map;
          setContent(map);
        }
      })
      .catch(() => {}); // silent — fall back to i18n
  }, [lang]);

  return content;
}
