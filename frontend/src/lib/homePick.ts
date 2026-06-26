import type { Event, NewsArticle } from '../types';

/** Афиша на главной: до `max` событий. На вход ожидается список, уже
 *  отсортированный по ближайшей дате. События с флагом «лид» (is_lead)
 *  ставятся первыми (с сохранением порядка по дате между собой), остальные —
 *  следом по дате. Размер карточек одинаковый. */
export function pickHomeEvents(events: Event[], max = 3): Event[] {
  const leads = events.filter((e) => e.is_lead);
  const rest = events.filter((e) => !e.is_lead);
  return [...leads, ...rest].slice(0, max);
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
