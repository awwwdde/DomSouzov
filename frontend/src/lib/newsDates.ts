import type { NewsArticle } from '../types';
import { dateKey } from './eventDates';

export function newsDateKey(a: NewsArticle): string | null {
  if (!a.created_at) return null;
  const d = new Date(a.created_at);
  if (Number.isNaN(d.getTime())) return null;
  return dateKey(d);
}

export function formatNewsShortDate(a: NewsArticle, lang: 'ru' | 'en'): string {
  if (!a.created_at) return '—';
  const d = new Date(a.created_at);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

export function formatNewsLongDate(a: NewsArticle, lang: 'ru' | 'en'): string {
  if (!a.created_at) return '';
  const d = new Date(a.created_at);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return lang === 'ru' ? `${dd}.${mm}.${yyyy}` : `${dd}.${mm}.${yyyy}`;
}
