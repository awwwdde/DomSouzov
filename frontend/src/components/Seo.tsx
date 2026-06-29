import { useEffect } from 'react';

/* ============================================================ */
/* Seo — мета-теги страницы для клиентской SPA-навигации.       */
/* На проде те же теги сервер уже внедряет в HTML (backend/seo) */
/* для краулеров; здесь поддерживаем их при переходах и для     */
/* JS-краулеров. Канонический URL строится от SITE_URL.         */
/*                                                              */
/* Управляем <head> императивно (useEffect), без react-helmet:  */
/* helmet-async@2 с React 18 не пишет в DOM. Singleton-теги     */
/* (description/og/canonical) перезаписываются на месте, чтобы  */
/* не плодить дубли с тегами из index.html / серверной инъекции.*/
/* ============================================================ */

export const SITE_URL = 'https://union.awwwdde.art';
export const SITE_NAME = 'Дом Союзов';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

/** Бренд-ключевики: подмешиваются к keywords каждой страницы. */
export const BRAND_KEYWORDS = ['Дом Союзов', 'Колонный зал', 'Большая Дмитровка 1', 'Москва'];

function abs(pathOrUrl?: string): string {
  if (!pathOrUrl) return DEFAULT_IMAGE;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${SITE_URL}/${pathOrUrl.replace(/^\//, '')}`;
}

function dedup(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of items) {
    const s = (it || '').trim();
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
  }
  return out;
}

const MULTI = 'data-seo-multi'; // повторяемые теги (article:tag, JSON-LD) — пересоздаём целиком

/** Создаёт/обновляет singleton-мета по ключу (name|property). Пустой content удаляет тег. */
function setMeta(attr: 'name' | 'property', key: string, content?: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    if (el && el.hasAttribute(MULTI)) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

type SeoProps = {
  title: string;
  description?: string;
  /** Путь без домена, напр. "events/12" или "" для главной. */
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'event';
  lang?: 'ru' | 'en';
  /** Готовый объект JSON-LD (или массив объектов — будет сериализован). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Ключевые слова страницы (к ним всегда добавляются BRAND_KEYWORDS). */
  keywords?: string[];
  /** Метки материала (<meta property="article:tag">). */
  articleTags?: string[];
  /** Не индексировать (правовые/служебные). */
  noindex?: boolean;
};

export default function Seo({
  title,
  description,
  path = '',
  image,
  type = 'website',
  lang = 'ru',
  jsonLd,
  keywords,
  articleTags,
  noindex,
}: SeoProps) {
  const canonical = `${SITE_URL}/${path.replace(/^\//, '')}`.replace(/\/$/, '') || SITE_URL;
  const img = abs(image);
  const ogType = type === 'event' ? 'website' : type; // og не знает "event"
  const kw = dedup([...(keywords ?? []), ...BRAND_KEYWORDS]).join(', ');
  const tags = dedup(articleTags ?? []);
  const ldStr = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = title;
    document.documentElement.setAttribute('lang', lang);

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', kw);
    setLink('canonical', canonical);
    setMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );

    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', lang === 'ru' ? 'ru_RU' : 'en_US');
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', img);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', img);

    // Повторяемые теги: убираем прошлые и добавляем актуальные.
    document.head.querySelectorAll(`[${MULTI}]`).forEach((n) => n.remove());

    for (const tag of tags) {
      const m = document.createElement('meta');
      m.setAttribute('property', 'article:tag');
      m.setAttribute('content', tag);
      m.setAttribute(MULTI, '');
      document.head.appendChild(m);
    }

    if (ldStr) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute(MULTI, '');
      s.textContent = ldStr;
      document.head.appendChild(s);
    }

    return () => {
      // На размонтировании чистим только повторяемые (singleton перезапишет след. страница).
      document.head.querySelectorAll(`[${MULTI}]`).forEach((n) => n.remove());
    };
  }, [title, description, canonical, img, ogType, lang, kw, tags.join('|'), ldStr, noindex]);

  return null;
}
