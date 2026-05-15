import type { Event, Lang } from '../types';

const pick = (obj: { ru: string; en: string }, lang: Lang) => obj[lang] || obj.ru;

const RU_DATE_MONTHS: Record<string, number> = {
  янв: 0, января: 0,
  фев: 1, февраля: 1,
  мар: 2, марта: 2,
  апр: 3, апреля: 3,
  май: 4, мая: 4,
  июн: 5, июня: 5,
  июл: 6, июля: 6,
  авг: 7, августа: 7,
  сен: 8, сент: 8, сентября: 8,
  окт: 9, октября: 9,
  ноя: 10, ноября: 10,
  дек: 11, декабря: 11,
};

const EN_DATE_MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/** Парсинг дат событий в формате афиши (RU/EN), как в календаре. */
export function parseEventDate(raw: string): Date | null {
  const normalized = raw.toLowerCase().replace(/[.,]/g, '').trim();
  const dayMatch = normalized.match(/\d{1,2}/);
  if (!dayMatch) return null;
  const day = Number(dayMatch[0]);
  const yearMatch = normalized.match(/\d{4}/);
  const year = yearMatch ? Number(yearMatch[0]) : new Date().getFullYear();
  const monthToken = normalized
    .split(/\s+/)
    .find((part) => Number.isNaN(Number(part)) && (RU_DATE_MONTHS[part] !== undefined || EN_DATE_MONTHS[part] !== undefined));
  if (!monthToken) return null;
  const month = RU_DATE_MONTHS[monthToken] ?? EN_DATE_MONTHS[monthToken];
  if (month === undefined) return null;
  return new Date(year, month, day);
}

export function parseEventDateForEvent(event: Event, lang: Lang): Date | null {
  return parseEventDate(pick(event.date, lang));
}

export function sortEventsByDate(events: Event[], lang: Lang): Event[] {
  return [...events].sort((a, b) => {
    const da = parseEventDateForEvent(a, lang);
    const db = parseEventDateForEvent(b, lang);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.getTime() - db.getTime();
  });
}

/** Формат DD.MM для карточки афиши (design.md §2.2). */
export function formatDayMonthFromEvent(event: Event, lang: Lang): string {
  const d = parseEventDateForEvent(event, lang);
  if (!d) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}
