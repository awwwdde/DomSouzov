import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import EventsC from '../components/EventsC';
import { RevealSection } from '../components/Reveal';

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
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Главная · Мероприятия' : 'Home · Events'}
          </div>
          <h1 className="font-heading text-[clamp(64px,10vw,150px)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">{lang === 'ru' ? 'Афиша' : 'Programme'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Концерты, литературные вечера, камерные программы и хоровая музыка. Полная афиша Дома Союзов — в Колонном и Октябрьском залах.'
            : 'Concerts, literary evenings, chamber programmes and choral music. Full programme across the Hall of Columns and October Hall.'}
        </p>
      </RevealSection>

      <RevealSection className="flex flex-wrap items-center gap-2 px-6 md:px-12" y={14}>
        <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'ФИЛЬТР' : 'FILTER'}</span>
        {FILTERS[lang].map((f, i) => (
          <button
            key={i}
            className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${filter === i ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:bg-paper'}`}
            onClick={() => setFilter(i)}
          >
            {f}
          </button>
        ))}
        <span className="hidden flex-1 md:block" />
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          {lang === 'ru' ? 'СОРТИРОВКА' : 'SORT'}: <b className="text-ink">
            {lang === 'ru' ? 'ПО ДАТЕ ↑' : 'BY DATE ↑'}
          </b>
        </span>
      </RevealSection>

      <EventsC events={filtered} showAll />
    </>
  );
}
