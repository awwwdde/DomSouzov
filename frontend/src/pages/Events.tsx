import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import EventStripList from '../components/EventStripList';
import UpcomingEventsCalendar from '../components/UpcomingEventsCalendar';
import { PageKicker } from '../components/PageKicker';
import { RevealSection } from '../components/Reveal';
import { formatDayMonthFromEvent } from '../lib/eventDates';
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
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Мероприятия' : 'Home · Events'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">{lang === 'ru' ? 'Афиша' : 'Programme'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">          {lang === 'ru'
            ? 'Концерты, литературные вечера, камерные программы и хоровая музыка. Полная афиша Дома Союзов — в Колонном и Октябрьском залах.'
            : 'Concerts, literary evenings, chamber programmes and choral music. Full programme across the Hall of Columns and October Hall.'}
        </p>
      </RevealSection>

      <RevealSection className="flex flex-wrap items-center gap-2 px-5 py-6 md:px-12" y={14}>
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

      <UpcomingEventsCalendar events={allEvents} lang={lang} variant="full" />

      <div className="bg-paper px-5 pb-20 md:px-12">
        <EventStripList
          events={filtered}
          lang={lang}
          getDayMonth={(e) => formatDayMonthFromEvent(e, lang)}
        />
      </div>
    </>
  );
}
