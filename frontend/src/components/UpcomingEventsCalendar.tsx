import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ActionButton from './ActionButton';
import { DURATION, EASE_DS, useReducedMotionActive } from '../lib/motion';
import { addDays, dateKey, parseEventDateForEvent, startOfDay } from '../lib/eventDates';
import type { Event, Lang } from '../types';

export type CalendarVariant = 'full' | 'compact';

type UpcomingEventsCalendarProps = {
  events: Event[];
  lang: Lang;
  /** `compact` — лента дат на главной; `full` — неделя/месяц на афише */
  variant?: CalendarVariant;
};

const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const RU_MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const RU_WEEKDAYS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const EN_WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const RU_WEEKDAYS_MON = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
const EN_WEEKDAYS_MON = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const FILTERS_RU = ['Все', 'Симфония', 'Камерная', 'Хор', 'Литература', 'Конференция'];
const FILTERS_EN = ['All', 'Symphony', 'Chamber', 'Choir', 'Literature', 'Conference'];
const FILTER_TOKENS: Record<number, string[]> = {
  1: ['Симфония', 'Симфоническая', 'Symphony', 'Symphonic'],
  2: ['Камерная', 'Chamber'],
  3: ['Хор', 'Хоровая', 'Choir', 'Choral'],
  4: ['Литература', 'Литературный', 'Literary'],
  5: ['Конференция', 'Conference'],
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);
const weekStart = (date: Date) => addDays(startOfDay(date), -((date.getDay() + 6) % 7));
const getWeekDates = (date: Date) => Array.from({ length: 7 }, (_, index) => addDays(weekStart(date), index));
const getMonthDates = (date: Date) =>
  Array.from(
    { length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() },
    (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1)
  );

const formatRange = (dates: Date[], lang: Lang) => {
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) return '';
  if (lang === 'ru') {
    return first.getMonth() === last.getMonth()
      ? `${first.getDate()}-${last.getDate()} ${RU_MONTHS[first.getMonth()]}`
      : `${first.getDate()} ${RU_MONTHS[first.getMonth()]} - ${last.getDate()} ${RU_MONTHS[last.getMonth()]}`;
  }
  return first.getMonth() === last.getMonth()
    ? `${EN_MONTHS[first.getMonth()]} ${first.getDate()}-${last.getDate()}`
    : `${EN_MONTHS[first.getMonth()]} ${first.getDate()} - ${EN_MONTHS[last.getMonth()]} ${last.getDate()}`;
};

function sortParsed(items: { event: Event; date: Date | null }[]) {
  return [...items].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.getTime() - b.date.getTime();
  });
}

function CompactStrip({ events, lang }: { events: Event[]; lang: Lang }) {
  const reduced = useReducedMotionActive();
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const stripDates = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i)),
    []
  );
  const [selected, setSelected] = useState(() => startOfDay(new Date()));

  const parsedEvents = useMemo(
    () =>
      sortParsed(
        events.map((event) => ({
          event,
          date: parseEventDateForEvent(event, lang),
        }))
      ),
    [events, lang]
  );

  const eventCountByDate = useMemo(() => {
    const acc: Record<string, number> = {};
    parsedEvents.forEach((item) => {
      if (!item.date) return;
      const k = dateKey(item.date);
      acc[k] = (acc[k] ?? 0) + 1;
    });
    return acc;
  }, [parsedEvents]);

  const selectedKey = dateKey(selected);
  const dayEvents = parsedEvents
    .filter((item) => item.date && dateKey(item.date) === selectedKey)
    .map((item) => item.event);

  return (
    <section className="border-y border-line bg-paper px-5 py-10 md:px-12 md:py-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-[clamp(26px,3.5vw,40px)] font-bold uppercase leading-none tracking-[0.04em] text-ink">
            {lang === 'ru' ? 'Календарь' : 'Calendar'}
          </h2>
        </div>
        <Link
          to="/events"
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink underline decoration-line underline-offset-4 transition hover:underline hover:underline-offset-4"
        >
          {lang === 'ru' ? 'Полная афиша →' : 'Full programme →'}
        </Link>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
        {stripDates.map((d) => {
          const k = dateKey(d);
          const count = eventCountByDate[k] ?? 0;
          const isSel = k === selectedKey;
          return (
            <motion.button
              key={k}
              type="button"
              layout={!reduced}
              onClick={() => setSelected(d)}
              className={[
                'relative flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-sm border px-2 py-3 text-left transition md:min-w-[5.25rem] md:px-3',
                isSel ? 'border-accent bg-paper-soft text-ink' : 'border-line bg-white text-ink-soft hover:border-ink/25',
              ].join(' ')}
            >
              {isSel ? (
                <motion.span
                  layoutId="compact-cal-ring"
                  className="pointer-events-none absolute inset-0 z-10 rounded-sm ring-2 ring-accent ring-offset-2 ring-offset-paper"
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                {lang === 'ru' ? RU_WEEKDAYS[d.getDay()] : EN_WEEKDAYS[d.getDay()]}
              </span>
              <span className="font-heading text-2xl font-bold leading-none md:text-3xl">{d.getDate()}</span>
              {count > 0 ? (
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-accent">{count}</span>
              ) : (
                <span className="h-3" />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 min-h-[120px] border-t border-line pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedKey}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : DURATION.fast, ease: EASE_DS }}
            className="grid gap-4"
          >
            {dayEvents.length === 0 ? (
              <p className="text-sm text-ink-soft">
                {lang === 'ru' ? 'На эту дату событий в афише нет.' : 'No events listed for this date.'}
              </p>
            ) : (
              dayEvents.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/events/${ev.id}`}
                  className="group grid gap-1 border-b border-line pb-4 last:border-0 md:grid-cols-[100px_1fr]"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{ev.time}</span>
                  <div>
                    <div className="font-heading text-lg font-bold uppercase tracking-[0.04em] text-ink transition group-hover:underline group-hover:underline-offset-4 md:text-xl">
                      {l(ev.title)}
                    </div>
                    <div className="mt-1 text-xs text-ink-soft">{l(ev.hall)}</div>
                  </div>
                </Link>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function FullCalendar({ events, lang }: { events: Event[]; lang: Lang }) {
  const reduced = useReducedMotionActive();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState<Date>(today);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selected, setSelected] = useState<Date | null>(null);
  const [filterIdx, setFilterIdx] = useState(0);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  const matchesFilter = (event: Event) => {
    if (filterIdx === 0) return true;
    const tokens = FILTER_TOKENS[filterIdx] ?? [];
    return tokens.some((t) => event.tag.ru.includes(t) || event.tag.en.includes(t));
  };

  const parsedEvents = useMemo(
    () =>
      sortParsed(
        events
          .filter(matchesFilter)
          .map((event) => ({ event, date: parseEventDateForEvent(event, lang) }))
      ),
    [events, lang, filterIdx]
  );

  const eventCountByDate = useMemo(() => {
    const acc: Record<string, number> = {};
    parsedEvents.forEach((item) => {
      if (!item.date) return;
      const k = dateKey(item.date);
      acc[k] = (acc[k] ?? 0) + 1;
    });
    return acc;
  }, [parsedEvents]);

  const weekDates = useMemo(() => getWeekDates(cursor), [cursor]);

  const monthGridCells = useMemo<(Date | null)[]>(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const lead = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const monthDates = Array.from(
      { length: daysInMonth },
      (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)
    );
    const trailing = (7 - ((lead + daysInMonth) % 7)) % 7;
    return [
      ...Array.from<null>({ length: lead }).fill(null),
      ...monthDates,
      ...Array.from<null>({ length: trailing }).fill(null),
    ];
  }, [cursor]);

  const gridCells = view === 'week' ? weekDates : monthGridCells;
  const listedEvents = useMemo(() => {
    if (selected) {
      const k = dateKey(selected);
      return parsedEvents.filter((item) => item.date && dateKey(item.date) === k).map((item) => item.event);
    }
    return parsedEvents.map((item) => item.event);
  }, [parsedEvents, selected]);

  const shift = (dir: -1 | 1) => {
    setCursor((current) => (view === 'week' ? addDays(current, dir * 7) : addMonths(current, dir)));
  };

  const goToday = () => {
    setCursor(today);
    setSelected(today);
  };

  const handleSelectDay = (date: Date) => {
    if (selected && dateKey(selected) === dateKey(date)) {
      setSelected(null);
    } else {
      setSelected(date);
      if (view === 'month' && (date.getMonth() !== cursor.getMonth() || date.getFullYear() !== cursor.getFullYear())) {
        setCursor(date);
      }
    }
  };

  const titleText =
    view === 'week'
      ? lang === 'ru'
        ? `Неделя ${formatRange(weekDates, lang)}`
        : `Week of ${formatRange(weekDates, lang)}`
      : lang === 'ru'
        ? `${RU_MONTHS_NOM[cursor.getMonth()]} ${cursor.getFullYear()}`
        : `${EN_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  const filterLabels = lang === 'ru' ? FILTERS_RU : FILTERS_EN;
  const weekdayLabels = lang === 'ru' ? RU_WEEKDAYS_MON : EN_WEEKDAYS_MON;

  const listHeader = selected
    ? lang === 'ru'
      ? `${selected.getDate()} ${RU_MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
      : `${EN_MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`
    : lang === 'ru'
      ? 'Все мероприятия'
      : 'All events';

  return (
    <section className="bg-paper px-5 pb-20 md:px-12">
      <motion.div
        className="border-y border-line bg-paper py-6 md:py-7"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE_DS }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
              {titleText}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label={lang === 'ru' ? 'Предыдущий период' : 'Previous period'}
              onClick={() => shift(-1)}
              className="inline-flex h-10 w-10 items-center justify-center border border-line bg-white text-ink transition hover:border-ink"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="inline-flex h-10 items-center border border-line bg-white px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition hover:border-ink"
            >
              {lang === 'ru' ? 'Сегодня' : 'Today'}
            </button>
            <button
              type="button"
              aria-label={lang === 'ru' ? 'Следующий период' : 'Next period'}
              onClick={() => shift(1)}
              className="inline-flex h-10 w-10 items-center justify-center border border-line bg-white text-ink transition hover:border-ink"
            >
              <ChevronRight size={16} />
            </button>
            <div className="ml-1 inline-flex h-10 border border-line bg-white">
              <button
                type="button"
                onClick={() => setView('week')}
                className={[
                  'px-4 text-[10px] font-bold uppercase tracking-[0.16em] transition',
                  view === 'week' ? 'bg-ink text-white' : 'text-ink hover:bg-paper-soft',
                ].join(' ')}
              >
                {lang === 'ru' ? 'Неделя' : 'Week'}
              </button>
              <button
                type="button"
                onClick={() => setView('month')}
                className={[
                  'px-4 text-[10px] font-bold uppercase tracking-[0.16em] transition',
                  view === 'month' ? 'bg-ink text-white' : 'text-ink hover:bg-paper-soft',
                ].join(' ')}
              >
                {lang === 'ru' ? 'Месяц' : 'Month'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            {lang === 'ru' ? 'ФИЛЬТР' : 'FILTER'}
          </span>
          {filterLabels.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFilterIdx(i)}
              className={[
                'rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition',
                filterIdx === i ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-7 border-b border-line">
        {weekdayLabels.map((wd) => (
          <div
            key={wd}
            className="px-2 pb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted md:text-left md:px-3"
          >
            {wd}
          </div>
        ))}
      </div>

      <LayoutGroup id="calendar-day-grid">
        <motion.div
          layout={!reduced}
          className="grid grid-cols-7 border-l border-t border-line bg-white"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE_DS }}
        >
          {gridCells.map((d, idx) => {
            if (!d) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-16 border-b border-r border-line bg-paper-soft/40 md:min-h-24"
                  aria-hidden
                />
              );
            }
            const k = dateKey(d);
            const count = eventCountByDate[k] ?? 0;
            const isToday = k === dateKey(today);
            const isSelected = !!selected && k === dateKey(selected);
            const isOutOfMonth = view === 'month' && d.getMonth() !== cursor.getMonth();
            const isPast = d.getTime() < today.getTime();

            return (
              <motion.button
                key={k}
                type="button"
                onClick={() => handleSelectDay(d)}
                whileHover={reduced ? undefined : { y: -1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.18, ease: EASE_DS }}
                className={[
                  'group relative flex min-h-16 flex-col items-stretch gap-1 border-b border-r border-line px-2 py-2 text-left transition md:min-h-24 md:px-3 md:py-3',
                  isSelected
                    ? 'bg-ink text-white'
                    : isOutOfMonth
                      ? 'bg-paper-soft/40 text-ink-soft/50'
                      : isPast
                        ? 'bg-white text-ink-soft hover:bg-paper-soft'
                        : 'bg-white text-ink hover:bg-paper-soft',
                  isToday && !isSelected ? 'shadow-[inset_0_-3px_0_0_#0a0a0a]' : '',
                ].join(' ')}
                aria-label={
                  lang === 'ru'
                    ? `${d.getDate()} ${RU_MONTHS[d.getMonth()]}, событий: ${count}`
                    : `${EN_MONTHS[d.getMonth()]} ${d.getDate()}, events: ${count}`
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={[
                      'font-heading text-xl font-bold leading-none md:text-2xl',
                      isSelected ? 'text-white' : '',
                    ].join(' ')}
                  >
                    {d.getDate()}
                  </span>
                  {count > 0 ? (
                    <span
                      className={[
                        'inline-flex h-5 min-w-5 items-center justify-center px-1 text-[10px] font-bold leading-none',
                        isSelected ? 'bg-white text-ink' : 'bg-ink text-white',
                      ].join(' ')}
                    >
                      {count}
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto hidden flex-col gap-0.5 md:flex">
                  {parsedEvents
                    .filter((item) => item.date && dateKey(item.date) === k)
                    .slice(0, 2)
                    .map((item) => (
                      <span
                        key={item.event.id}
                        className={[
                          'truncate text-[10px] font-semibold uppercase tracking-[0.06em]',
                          isSelected ? 'text-white/85' : 'text-ink-soft',
                        ].join(' ')}
                      >
                        · {l(item.event.title)}
                      </span>
                    ))}
                  {count > 2 ? (
                    <span
                      className={[
                        'text-[9px] font-bold uppercase tracking-[0.14em]',
                        isSelected ? 'text-white/70' : 'text-muted',
                      ].join(' ')}
                    >
                      +{count - 2}
                    </span>
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </LayoutGroup>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <h3 className="font-heading text-[clamp(22px,2.8vw,36px)] font-bold uppercase leading-none tracking-[0.02em] text-ink">
          {listHeader}
        </h3>
        {selected ? (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="border border-line bg-white px-4 py-2 font-heading text-sm font-bold uppercase tracking-[0.08em] text-ink transition hover:border-ink"
          >
            {lang === 'ru' ? 'Сбросить день' : 'Clear day'}
          </button>
        ) : null}
      </div>

      <AnimatePresence mode="popLayout">
        {listedEvents.length === 0 ? (
          <motion.div
            key="empty"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE_DS }}
            className="border-b border-line py-10 text-center text-sm text-ink-soft"
          >
            {selected
              ? lang === 'ru'
                ? 'На эту дату событий нет.'
                : 'No events on this date.'
              : filterIdx === 0
                ? lang === 'ru'
                  ? 'Мероприятий пока нет.'
                  : 'No events yet.'
                : lang === 'ru'
                  ? 'По выбранному фильтру событий нет.'
                  : 'No events match the selected filter.'}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="grid w-full gap-0"
            role="list"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.45, ease: EASE_DS }}
          >
            {listedEvents.map((event, index) => {
              const eventDate = parseEventDateForEvent(event, lang);
              const day = eventDate?.getDate() ?? l(event.date).match(/\d{1,2}/)?.[0] ?? '';
              const month = eventDate
                ? lang === 'ru'
                  ? RU_MONTHS[eventDate.getMonth()]
                  : EN_MONTHS[eventDate.getMonth()]
                : l(event.date).replace(String(day), '').trim();

              return (
                <div
                  key={event.id}
                  className="sticky top-[105px] bg-white md:top-[120px]"
                  style={{ zIndex: index + 1 }}
                >
                <motion.article
                  role="listitem"
                  className="grid min-h-[420px] items-center gap-5 border-t border-line bg-white px-4 py-6 md:grid-cols-[minmax(110px,0.35fr)_minmax(260px,520px)_minmax(0,1fr)] md:gap-7 md:px-6 md:py-8"
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: DURATION.base,
                          delay: Math.min(index * 0.04, 0.2),
                          ease: EASE_DS,
                        }
                  }
                >
                  <div className="flex items-end gap-3 pl-1 md:grid md:gap-2 md:pl-2 md:self-start">
                    <span className="font-heading text-[clamp(56px,7vw,100px)] font-bold uppercase leading-[0.82] tracking-[-0.05em] text-ink">
                      {day}
                    </span>
                    <span className="pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted md:pb-0">
                      {month}
                    </span>
                  </div>

                  <div className="aspect-[580/394] w-full overflow-hidden bg-paper-soft">
                    {event.image ? (
                      <motion.img
                        className="h-full w-full object-cover"
                        src={event.image}
                        alt={l(event.title)}
                        initial={reduced ? false : { scale: 1.04 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={reduced ? { duration: 0 } : { duration: 1.1, ease: EASE_DS }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                        {l(event.tag)}
                      </div>
                    )}
                  </div>

                  <div className="self-center">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      <span>{event.weekday[lang]}</span>
                      <span>{event.time}</span>
                      <span>{l(event.hall)}</span>
                    </div>
                    <h4 className="mt-3 max-w-3xl font-heading text-[clamp(22px,2.8vw,40px)] font-bold uppercase leading-[0.98] tracking-[0.02em] text-ink">
                      {l(event.title)}
                    </h4>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft md:text-base">
                      {l(event.tag)} · {l(event.price)}
                    </p>
                    <ActionButton
                      to={`/events/${event.id}`}
                      text={lang === 'ru' ? 'Подробнее' : 'Details'}
                      backgroundColor="#0a0a0a"
                      textColor="#ffffff"
                      strokeColor="#0a0a0a"
                      className="mt-5"
                    />
                  </div>
                </motion.article>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function UpcomingEventsCalendar({ events, lang, variant = 'full' }: UpcomingEventsCalendarProps) {
  if (variant === 'compact') {
    return <CompactStrip events={events} lang={lang} />;
  }
  return <FullCalendar events={events} lang={lang} />;
}
