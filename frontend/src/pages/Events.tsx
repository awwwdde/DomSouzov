import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import EventsC from '../components/EventsC';

const FILTERS = {
  ru: ['Все', 'Симфония', 'Камерная', 'Хор', 'Литература', 'Конференция'],
  en: ['All', 'Symphony', 'Chamber', 'Choir', 'Literature', 'Conference'],
};

export default function Events() {
  const { lang, content } = useSite();
  const [filter, setFilter] = useState(0);
  const allEvents = content?.events ?? [];

  const filterTags: Record<number, string[]> = {
    1: ['Симфоническая', 'Symphonic'],
    2: ['Камерная', 'Chamber'],
    3: ['Хоровая', 'Choral'],
    4: ['Литературный', 'Literary'],
    5: ['Конференция', 'Conference'],
  };

  const filtered = filter === 0
    ? allEvents
    : allEvents.filter((e) =>
        filterTags[filter]?.some(
          (tag) => e.tag.ru.includes(tag) || e.tag.en.includes(tag)
        )
      );

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">
            {lang === 'ru' ? 'Главная · Мероприятия' : 'Home · Events'}
          </div>
          <h1 className="serif">{lang === 'ru' ? 'Афиша' : 'Programme'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Концерты, литературные вечера, камерные программы и хоровая музыка. Полная афиша Дома Союзов — в Колонном и Октябрьском залах.'
            : 'Concerts, literary evenings, chamber programmes and choral music. Full programme across the Hall of Columns and October Hall.'}
        </p>
      </section>

      <div className="filters">
        <span className="label mono">{lang === 'ru' ? 'ФИЛЬТР' : 'FILTER'}</span>
        {FILTERS[lang].map((f, i) => (
          <button
            key={i}
            className={`chip${filter === i ? ' active' : ''}`}
            onClick={() => setFilter(i)}
          >
            {f}
          </button>
        ))}
        <span className="sp" />
        <span className="label mono">
          {lang === 'ru' ? 'СОРТИРОВКА' : 'SORT'}: <b className="sort-current">
            {lang === 'ru' ? 'ПО ДАТЕ ↑' : 'BY DATE ↑'}
          </b>
        </span>
      </div>

      <EventsC events={filtered} showAll />
    </>
  );
}
