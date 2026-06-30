/** Стандартные теги/рубрики, общие для админки.
 *  Меняешь список здесь — выпадающие списки в «Мероприятиях» и «Архиве мероприятий»
 *  обновляются автоматически. */

export interface Category {
  ru: string;
  en: string;
}

/** Категории мероприятий (поле «Категория» в афише).
 *  Эти же категории используются для рубрик новостей (см. AdminNews). */
export const EVENT_CATEGORIES: Category[] = [
  { ru: 'Концерт', en: 'Concert' },
  { ru: 'Бал', en: 'Ball' },
  { ru: 'Форум', en: 'Forum' },
  { ru: 'Спектакль', en: 'Performance' },
];

/** Рубрики новостей (поле «Рубрика» в хрониках). */
export const NEWS_CATEGORIES: Category[] = [
  { ru: 'Анонс', en: 'Announcement' },
  { ru: 'Фестиваль', en: 'Festival' },
  { ru: 'Премьера', en: 'Premiere' },
  { ru: 'Интервью', en: 'Interview' },
  { ru: 'Репортаж', en: 'Feature' },
  { ru: 'История', en: 'History' },
];
