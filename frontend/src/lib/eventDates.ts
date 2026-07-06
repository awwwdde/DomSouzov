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

/** Формат DD.MM для карточки афиши (design.md §2.2).
 *  Для мультидат — диапазон «DD.MM–DD.MM» (первая и последняя дата). */
export function formatDayMonthFromEvent(event: Event, lang: Lang): string {
  const occ = eventOccurrences(event, lang);
  const dd = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (occ.length === 0) return '—';
  const first = occ[0].date;
  const last = occ[occ.length - 1].date;
  if (occ.length === 1 || dateKey(first) === dateKey(last)) return dd(first);
  return `${dd(first)}–${dd(last)}`;
}

/** Мероприятие «прошло», если его ПОСЛЕДНИЙ сеанс раньше сегодняшнего дня.
 *  Многодневное скрывается только после последней даты; в день проведения
 *  ещё показывается. Без распознаваемой даты — считаем актуальным (не прячем).
 *  Дата берётся из RU-строк (они всегда есть) — значение не зависит от языка. */
export function isEventPast(event: Event, now: Date = new Date()): boolean {
  const occ = eventOccurrences(event, 'ru');
  if (occ.length === 0) return false;
  const last = occ[occ.length - 1].date;
  return last.getTime() < startOfDay(now).getTime();
}

/** Оставляет только актуальные (непрошедшие) мероприятия — для публичной афиши. */
export function filterUpcomingEvents(events: Event[], now: Date = new Date()): Event[] {
  return events.filter((e) => !isEventPast(e, now));
}

/** Один сеанс мероприятия: распарсенная дата + время. */
export interface ParsedOccurrence {
  date: Date;
  time: string;
}

/** Разворачивает мероприятие в список сеансов (отсортированных по дате).
 *  Если заданы мультидаты — берём их; иначе одиночная date/time. */
export function eventOccurrences(event: Event, lang: Lang): ParsedOccurrence[] {
  const raw = event.dates && event.dates.length > 0
    ? event.dates
    : [{ date: event.date.ru, date_en: event.date.en, time: event.time }];
  const out: ParsedOccurrence[] = [];
  for (const o of raw) {
    const d = parseEventDate(lang === 'ru' ? o.date : (o.date_en || o.date));
    if (d) out.push({ date: d, time: o.time || event.time });
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}
