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
  { ru: 'Гала-концерт', en: 'Gala concert' },
  { ru: 'Бал', en: 'Ball' },
  { ru: 'Форум', en: 'Forum' },
  { ru: 'Конференция', en: 'Conference' },
  { ru: 'Съезд', en: 'Congress' },
  { ru: 'Спектакль', en: 'Performance' },
  { ru: 'Фестиваль', en: 'Festival' },
  { ru: 'Церемония', en: 'Ceremony' },
  { ru: 'Вечер памяти', en: 'Memorial evening' },
  { ru: 'Творческий вечер', en: 'Artist’s evening' },
  { ru: 'Выставка', en: 'Exhibition' },
  { ru: 'Экскурсия', en: 'Guided tour' },
  { ru: 'Лекция', en: 'Lecture' },
  { ru: 'Детям', en: 'For children' },
  { ru: 'Кинопоказ', en: 'Film screening' },
  { ru: 'Премия', en: 'Award ceremony' },
  { ru: 'Приём', en: 'Reception' },
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
