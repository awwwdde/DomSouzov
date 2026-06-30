import {
  Music2,
  Sparkles,
  Users,
  Drama,
  type LucideIcon,
} from 'lucide-react';

/** Иконка категории по тексту тега события (RU/EN).
 *  Базовые категории: Концерт · Бал · Форум · Спектакль. */
export function eventCategoryIcon(tag: string): LucideIcon {
  const t = (tag || '').toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));

  if (has('бал', 'ball')) return Sparkles;
  if (has('форум', 'forum', 'собрание', 'meeting', 'конференц', 'conference', 'съезд', 'заседан', 'assembly'))
    return Users;
  if (has('спектакл', 'performance', 'театр', 'theatre', 'theater', 'балет', 'опера', 'opera', 'литератур'))
    return Drama;
  // Концерт и музыкальные форматы — по умолчанию.
  return Music2;
}

/** Оттенок зелёного для категории — для раскраски календаря афиши.
 *  Каждая категория = свой оттенок, чтобы события визуально различались. */
export function eventCategoryColor(tag: string): string {
  const t = (tag || '').toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));

  if (has('бал', 'ball')) return '#3f8f6a';                          // светлый зелёный
  if (has('форум', 'forum', 'собрание', 'meeting', 'конференц', 'съезд', 'assembly'))
    return '#7a9b3f';                                                 // оливково-зелёный
  if (has('спектакл', 'performance', 'театр', 'theatre', 'балет', 'опера', 'литератур'))
    return '#0d3b2e';                                                 // тёмный изумруд
  return '#1f5f4e';                                                   // Концерт — брендовый зелёный
}
