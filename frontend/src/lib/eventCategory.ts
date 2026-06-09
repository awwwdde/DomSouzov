import {
  Music2,
  Sparkles,
  Footprints,
  Users,
  type LucideIcon,
} from 'lucide-react';

/** Иконка категории по тексту тега события (RU/EN).
 *  Базовые категории: Концерт · Мероприятие · Экскурсия · Собрание. */
export function eventCategoryIcon(tag: string): LucideIcon {
  const t = (tag || '').toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));

  if (has('экскурс', 'excursion', 'tour', 'лекци', 'lecture')) return Footprints;
  if (has('собрание', 'meeting', 'конференц', 'conference', 'форум', 'forum', 'съезд', 'заседан', 'assembly')) return Users;
  if (has('мероприят', 'event', 'фестивал', 'festival', 'премьер', 'premiere', 'гала', 'gala', 'спектакл', 'литератур')) return Sparkles;
  // Концерт и музыкальные форматы — по умолчанию.
  return Music2;
}
