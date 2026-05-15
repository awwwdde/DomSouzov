import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import ActionButton from './ActionButton';
import { DURATION, EASE_DS, transitionBase, useReducedMotionActive } from '../lib/motion';
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
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-accent" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {lang === 'ru' ? 'Ближайшие даты' : 'Upcoming dates'}
            </span>
          </div>
          <h2 className="font-heading text-[clamp(26px,3.5vw,40px)] font-bold uppercase leading-none tracking-[0.04em] text-ink">
            {lang === 'ru' ? 'Календарь' : 'Calendar'}
          </h2>
        </div>
        <Link
          to="/events"
          className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink underline decoration-line underline-offset-4 transition hover:text-accent"
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
                    <div className="font-heading text-lg font-bold uppercase tracking-[0.04em] text-ink transition group-hover:text-accent md:text-xl">
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
  const [calendarDate, setCalendarDate] = useState(() => startOfDay(new Date()));
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const fallbackEvents = useMemo(() => events.slice(0, 10), [events]);
  const calendarDates = calendarView === 'week' ? getWeekDates(calendarDate) : getMonthDates(calendarDate);
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
  const visibleEvents = parsedEvents
    .filter((item) => item.date && calendarDates.some((date) => dateKey(date) === dateKey(item.date as Date)))
    .map((item) => item.event);
  const calendarEvents = visibleEvents.length > 0 ? visibleEvents : fallbackEvents;
  const currentWeekDates = getWeekDates(new Date());
  const selectedDateKey = dateKey(calendarDate);
  const visibleRange = formatRange(calendarDates, lang);
  const calendarTitle =
    calendarView === 'week'
      ? lang === 'ru'
        ? `Неделя ${visibleRange}`
        : `Week of ${visibleRange}`
      : lang === 'ru'
        ? `${RU_MONTHS_NOM[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`
        : `${EN_MONTHS[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;

  const shiftCalendar = (direction: -1 | 1) => {
    setCalendarDate((current) =>
      calendarView === 'week' ? addDays(current, direction * 7) : addMonths(current, direction)
    );
  };

  return (
    <section className="relative w-full overflow-visible bg-white px-5 py-6 md:px-12 md:py-8">
      <div className="sticky top-0 z-50 w-full bg-white pb-4 pt-3 md:pt-4">
        <motion.div
          className="relative border-y border-line py-4"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={reduced ? { duration: 0 } : { ...transitionBase, delay: 0.08 }}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                {calendarView === 'week'
                  ? lang === 'ru'
                    ? 'Текущая сетка недели'
                    : 'Current week grid'
                  : lang === 'ru'
                    ? 'Сетка месяца'
                    : 'Month grid'}
              </div>
              <div className="mt-1 font-heading text-[clamp(24px,3vw,42px)] font-medium uppercase leading-none tracking-[-0.03em]">
                {calendarTitle}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center border border-line bg-paper transition hover:border-ink"
                onClick={() => shiftCalendar(-1)}
                aria-label={lang === 'ru' ? 'Предыдущий период' : 'Previous period'}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center border border-line bg-paper transition hover:border-ink"
                onClick={() => shiftCalendar(1)}
                aria-label={lang === 'ru' ? 'Следующий период' : 'Next period'}
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-2 border border-ink bg-ink px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-transparent hover:text-ink"
                onClick={() => setCalendarView((current) => (current === 'week' ? 'month' : 'week'))}
              >
                {calendarView === 'week'
                  ? lang === 'ru'
                    ? 'Весь месяц'
                    : 'Full month'
                  : lang === 'ru'
                    ? 'Неделя'
                    : 'Week'}
                {calendarView === 'week' ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>
              <button
                type="button"
                className="border border-line bg-paper px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-ink"
                onClick={() => {
                  setCalendarDate(startOfDay(new Date()));
                  setCalendarView('week');
                }}
              >
                {lang === 'ru'
                  ? `Сегодня ${RU_WEEKDAYS[new Date().getDay()]} ${new Date().getDate()} ${RU_MONTHS[new Date().getMonth()]}`
                  : `Today ${EN_WEEKDAYS[new Date().getDay()]} ${EN_MONTHS[new Date().getMonth()]} ${new Date().getDate()}`}
              </button>
            </div>
          </div>

          <LayoutGroup id="calendar-day-grid">
            <motion.div
              layout={!reduced}
              className="grid grid-cols-7 gap-x-2 gap-y-3 md:gap-x-4"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE_DS }}
            >
              {calendarDates.map((date) => {
                const key = dateKey(date);
                const eventsCount = eventCountByDate[key] ?? 0;
                const isToday = key === dateKey(new Date());
                const isSelected = key === selectedDateKey;
                const isCurrentWeek = currentWeekDates.some((weekDate) => dateKey(weekDate) === key);

                return (
                  <motion.button
                    key={key}
                    type="button"
                    layout={!reduced}
                    layoutId={`cal-day-${key}`}
                    className={[
                      'group relative grid min-h-16 content-start gap-2 px-2 py-2 text-left transition md:min-h-20 md:px-3',
                      eventsCount > 0 ? 'text-ink' : 'text-ink-soft',
                      isSelected ? 'bg-ink text-white' : 'bg-transparent hover:bg-ink/[0.04]',
                      isToday && !isSelected ? 'shadow-[inset_0_-2px_0_#171717]' : '',
                      calendarView === 'month' && !isCurrentWeek ? 'opacity-70' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setCalendarDate(date);
                      setCalendarView('week');
                    }}
                    whileHover={reduced ? undefined : { y: -2 }}
                    transition={
                      reduced
                        ? { layout: { duration: 0 }, duration: 0 }
                        : { layout: { duration: DURATION.base, ease: EASE_DS }, duration: 0.2 }
                    }
                  >
                    {isSelected ? (
                      <motion.span
                        layoutId="day-ring"
                        className="pointer-events-none absolute inset-0 z-10 rounded-sm ring-2 ring-accent ring-offset-2 ring-offset-transparent"
                        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <span
                      className={['text-[10px] font-semibold uppercase tracking-[0.12em]', isSelected ? 'text-white/70' : 'text-muted'].join(
                        ' '
                      )}
                    >
                      {lang === 'ru' ? RU_WEEKDAYS[date.getDay()] : EN_WEEKDAYS[date.getDay()]}
                    </span>
                    <span className="font-heading text-2xl font-medium leading-none tracking-[-0.02em] md:text-4xl">
                      {date.getDate()}
                    </span>
                    {eventsCount > 0 ? (
                      <span
                        className={[
                          'mt-1 inline-flex h-5 w-fit min-w-5 items-center justify-center px-1 text-[10px] font-semibold leading-none',
                          isSelected ? 'bg-white text-ink' : 'bg-ink text-white',
                        ].join(' ')}
                        aria-label={lang === 'ru' ? `${eventsCount} событий` : `${eventsCount} events`}
                      >
                        {eventsCount}
                      </span>
                    ) : null}
                  </motion.button>
                );
              })}
            </motion.div>
          </LayoutGroup>
        </motion.div>
      </div>

      {calendarEvents.length > 0 ? (
        <LayoutGroup id="calendar-events">
          <motion.div
            className="mt-6 grid w-full gap-0"
            role="list"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.45, ease: EASE_DS }}
          >
            <div className="mb-3 flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              <span>{lang === 'ru' ? 'События периода' : 'Events in period'}</span>
              <span>
                {visibleEvents.length > 0 ? calendarEvents.length : lang === 'ru' ? 'Ближайшие' : 'Nearest'}
              </span>
            </div>

            {calendarEvents.map((event, index) => {
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
                  role="listitem"
                  className="sticky top-[174px] bg-white md:top-[190px]"
                  style={{ zIndex: index + 1 }}
                >
                  <motion.article
                    layout={!reduced}
                    layoutId={`event-${event.id}`}
                    className="grid min-h-[340px] items-center gap-5 border-t border-line bg-white px-4 py-6 md:grid-cols-[minmax(118px,0.42fr)_minmax(300px,580px)_minmax(0,1fr)] md:gap-7 md:px-6 md:py-8"
                    initial={reduced ? false : { opacity: 0, y: 34, scale: 0.99 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={
                      reduced
                        ? { layout: { duration: 0 }, duration: 0 }
                        : {
                            duration: DURATION.base,
                            delay: Math.min(index * 0.04, 0.18),
                            ease: EASE_DS,
                            layout: { duration: DURATION.base, ease: EASE_DS },
                          }
                    }
                  >
                    <div className="flex items-end gap-3 pl-1 md:grid md:gap-2 md:pl-2 md:self-start">
                      <span className="font-heading text-[clamp(56px,8vw,118px)] font-medium uppercase leading-[0.82] tracking-[-0.07em]">
                        {day}
                      </span>
                      <span className="pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted md:pb-0">
                        {month}
                      </span>
                    </div>

                    <div className="aspect-[580/394] w-full overflow-hidden bg-ink/[0.04]">
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
                        <div className="flex h-full items-center justify-center p-4 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                          {l(event.tag)}
                        </div>
                      )}
                    </div>

                    <div className="self-center">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        <span>{event.weekday[lang]}</span>
                        <span>{event.time}</span>
                        <span>{l(event.hall)}</span>
                      </div>
                      <h3 className="mt-3 max-w-3xl font-heading text-[clamp(25px,3.4vw,52px)] font-medium uppercase leading-[0.98] tracking-[-0.035em]">
                        {l(event.title)}
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-6 text-ink-soft md:text-base">
                        {l(event.tag)} · {l(event.price)}
                      </p>
                      <ActionButton
                        to={`/events/${event.id}`}
                        text={lang === 'ru' ? 'Подробнее' : 'Details'}
                        backgroundColor="#171717"
                        textColor="#ffffff"
                        strokeColor="#171717"
                        className="mt-5"
                      />
                    </div>
                  </motion.article>
                </div>
              );
            })}
          </motion.div>
        </LayoutGroup>
      ) : (
        <div className="border-y border-line py-5 text-sm text-ink-soft">
          {lang === 'ru' ? 'Афиша скоро обновится.' : 'Programme will be updated soon.'}
        </div>
      )}
    </section>
  );
}

export default function UpcomingEventsCalendar({ events, lang, variant = 'full' }: UpcomingEventsCalendarProps) {
  if (variant === 'compact') {
    return <CompactStrip events={events} lang={lang} />;
  }
  return <FullCalendar events={events} lang={lang} />;
}
