import type { Event, NewsArticle } from '../types';

/** До 6 элементов: сначала закреплённые (по pin_order desc), затем по дате создания / порядку. */
export function pickHomeEvents(events: Event[], max = 6): Event[] {
  const pinned = events.filter((e) => e.is_pinned).sort((a, b) => (b.pin_order ?? 0) - (a.pin_order ?? 0));
  const rest = events.filter((e) => !e.is_pinned).slice(0, Math.max(0, max - pinned.length));
  const merged = [...pinned, ...rest].slice(0, max);
  return merged.length ? merged : events.slice(0, max);
}

export function pickHomeNews(articles: NewsArticle[], max = 6): NewsArticle[] {
  const pinned = articles.filter((a) => a.is_pinned).sort((a, b) => (b.pin_order ?? 0) - (a.pin_order ?? 0));
  const rest = articles.filter((a) => !a.is_pinned);
  const byDate = [...rest].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const db = b.created_at ? new Date(b.created_at).getTime() : 0;
    return db - da;
  });
  const fill = byDate.slice(0, Math.max(0, max - pinned.length));
  const merged = [...pinned, ...fill].slice(0, max);
  return merged.length ? merged : articles.slice(0, max);
}
