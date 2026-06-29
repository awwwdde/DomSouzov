/** Стандартные теги/рубрики, общие для админки.
 *  Меняешь список здесь — выпадающие списки в «Мероприятиях» и «Архиве мероприятий»
 *  обновляются автоматически. */

export interface Category {
  ru: string;
  en: string;
}

/** Категории мероприятий (поле «Категория» в афише). */
export const EVENT_CATEGORIES: Category[] = [
  { ru: 'Концерт', en: 'Concert' },
  { ru: 'Мероприятие', en: 'Event' },
  { ru: 'Экскурсия', en: 'Excursion' },
  { ru: 'Собрание', en: 'Meeting' },
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
