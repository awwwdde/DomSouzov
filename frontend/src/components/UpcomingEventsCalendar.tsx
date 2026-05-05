import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import ActionButton from './ActionButton';
import type { Event, Lang } from '../types';

type UpcomingEventsCalendarProps = {
  events: Event[];
  lang: Lang;
};

const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const RU_MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const RU_WEEKDAYS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const EN_WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const RU_DATE_MONTHS: Record<string, number> = {
  янв: 0, января: 0,
  фев: 1, февраля: 1,
  мар: 2, марта: 2,
  апр: 3, апреля: 3,
  май: 4, мая: 4,
  июн: 5, июня: 5,
  июл: 6, июля: 6,
  авг: 7, августа: 7,
  сен: 8, сент: 8, сентября: 8,
  окт: 9, октября: 9,
  ноя: 10, ноября: 10,
  дек: 11, декабря: 11,
};
const EN_DATE_MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const weekStart = (date: Date) => addDays(startOfDay(date), -((date.getDay() + 6) % 7));
const getWeekDates = (date: Date) => Array.from({ length: 7 }, (_, index) => addDays(weekStart(date), index));
const getMonthDates = (date: Date) => Array.from(
  { length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() },
  (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1)
);

const parseEventDate = (raw: string) => {
  const normalized = raw.toLowerCase().replace(/[.,]/g, '').trim();
  const dayMatch = normalized.match(/\d{1,2}/);
  if (!dayMatch) return null;
  const day = Number(dayMatch[0]);
  const yearMatch = normalized.match(/\d{4}/);
  const year = yearMatch ? Number(yearMatch[0]) : new Date().getFullYear();
  const monthToken = normalized
    .split(/\s+/)
    .find((part) => Number.isNaN(Number(part)) && (RU_DATE_MONTHS[part] !== undefined || EN_DATE_MONTHS[part] !== undefined));
  if (!monthToken) return null;
  const month = RU_DATE_MONTHS[monthToken] ?? EN_DATE_MONTHS[monthToken];
  return new Date(year, month, day);
};

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

const sortByDate = (items: { event: Event; date: Date | null }[]) => [...items].sort((a, b) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date.getTime() - b.date.getTime();
});

export default function UpcomingEventsCalendar({ events, lang }: UpcomingEventsCalendarProps) {
  const [calendarDate, setCalendarDate] = useState(() => startOfDay(new Date()));
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const fallbackEvents = useMemo(() => events.slice(0, 10), [events]);
  const calendarDates = calendarView === 'week' ? getWeekDates(calendarDate) : getMonthDates(calendarDate);
  const parsedEvents = useMemo(() => sortByDate(events.map((event) => ({
    event,
    date: parseEventDate(l(event.date)),
  }))), [events, lang]);
  const eventCountByDate = useMemo(() => parsedEvents.reduce<Record<string, number>>((acc, item) => {
    if (!item.date) return acc;
    const key = dateKey(item.date);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {}), [parsedEvents]);
  const visibleEvents = parsedEvents
    .filter((item) => item.date && calendarDates.some((date) => dateKey(date) === dateKey(item.date as Date)))
    .map((item) => item.event);
  const calendarEvents = visibleEvents.length > 0 ? visibleEvents : fallbackEvents;
  const currentWeekDates = getWeekDates(new Date());
  const selectedDateKey = dateKey(calendarDate);
  const visibleRange = formatRange(calendarDates, lang);
  const calendarTitle = calendarView === 'week'
    ? (lang === 'ru' ? `Неделя ${visibleRange}` : `Week of ${visibleRange}`)
    : (lang === 'ru'
      ? `${RU_MONTHS_NOM[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`
      : `${EN_MONTHS[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`);

  const shiftCalendar = (direction: -1 | 1) => {
    setCalendarDate((current) => calendarView === 'week'
      ? addDays(current, direction * 7)
      : addMonths(current, direction)
    );
  };

  return (
    <section className="relative overflow-visible px-6 py-4 md:px-12 md:py-8">
      <div className="pointer-events-none absolute right-6 top-0 hidden font-heading text-[16vw] font-medium uppercase leading-none tracking-[-0.08em] text-ink/[0.025] md:block">
        {calendarView === 'week' ? 'Week' : 'Month'}
      </div>

      <div className="sticky top-0 z-50 -mx-6 bg-paper px-6 pb-4 pt-3 md:-mx-12 md:px-12 md:pt-4">
        <motion.div
          className="relative border-y border-line py-4"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              {calendarView === 'week'
                ? (lang === 'ru' ? 'Текущая сетка недели' : 'Current week grid')
                : (lang === 'ru' ? 'Сетка месяца' : 'Month grid')}
            </div>
            <div className="mt-1 font-heading text-[clamp(24px,3vw,42px)] font-medium uppercase leading-none tracking-[-0.03em]">
              {calendarTitle}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex h-9 w-9 items-center justify-center border border-line bg-paper transition hover:border-ink"
              onClick={() => shiftCalendar(-1)}
              aria-label={lang === 'ru' ? 'Предыдущий период' : 'Previous period'}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="inline-flex h-9 w-9 items-center justify-center border border-line bg-paper transition hover:border-ink"
              onClick={() => shiftCalendar(1)}
              aria-label={lang === 'ru' ? 'Следующий период' : 'Next period'}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="inline-flex min-h-9 items-center gap-2 border border-ink bg-ink px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-transparent hover:text-ink"
              onClick={() => setCalendarView((current) => current === 'week' ? 'month' : 'week')}
            >
              {calendarView === 'week'
                ? (lang === 'ru' ? 'Весь месяц' : 'Full month')
                : (lang === 'ru' ? 'Неделя' : 'Week')}
              {calendarView === 'week' ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
            <button
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

        <AnimatePresence mode="wait">
          <motion.div
            key={`${calendarView}-${calendarTitle}`}
            className="grid grid-cols-7 gap-x-2 gap-y-3 md:gap-x-4"
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
                  className={[
                    'group relative grid min-h-16 content-start gap-2 px-2 py-2 text-left transition md:min-h-20 md:px-3',
                    eventsCount > 0 ? 'text-ink' : 'text-ink-soft',
                    isSelected ? 'bg-ink text-white' : 'bg-transparent hover:bg-ink/[0.04]',
                    isToday && !isSelected ? 'shadow-[inset_0_-2px_0_#181818]' : '',
                    calendarView === 'month' && !isCurrentWeek ? 'opacity-70' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => {
                    setCalendarDate(date);
                    setCalendarView('week');
                  }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={['text-[10px] font-semibold uppercase tracking-[0.12em]', isSelected ? 'text-white/70' : 'text-muted'].join(' ')}>
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
        </AnimatePresence>
        </motion.div>
      </div>

      {calendarEvents.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${calendarView}-${visibleRange}-${calendarEvents.map((event) => event.id).join('-')}`}
            className="mt-6 grid gap-0 md:px-4"
            role="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-3 flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              <span>{lang === 'ru' ? 'События периода' : 'Events in period'}</span>
              <span>{visibleEvents.length > 0 ? calendarEvents.length : (lang === 'ru' ? 'Ближайшие' : 'Nearest')}</span>
            </div>

            {calendarEvents.map((event, index) => {
              const eventDate = parseEventDate(l(event.date));
              const day = eventDate?.getDate() ?? l(event.date).match(/\d{1,2}/)?.[0] ?? '';
              const month = eventDate
                ? (lang === 'ru' ? RU_MONTHS[eventDate.getMonth()] : EN_MONTHS[eventDate.getMonth()])
                : l(event.date).replace(String(day), '').trim();

              return (
                <div
                  key={event.id}
                  role="listitem"
                  className="sticky top-[174px] bg-paper md:top-[190px]"
                  style={{ zIndex: index + 1 }}
                >
                  <motion.article
                    className="grid min-h-[340px] items-center gap-5 border-t border-line bg-paper px-4 py-6 md:grid-cols-[minmax(118px,0.42fr)_minmax(300px,580px)_minmax(0,1fr)] md:gap-7 md:px-6 md:py-8"
                    initial={{ opacity: 0, y: 34, scale: 0.99 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={{ duration: 0.55, delay: Math.min(index * 0.04, 0.18), ease: [0.22, 1, 0.36, 1] }}
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
                          initial={{ scale: 1.04 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
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
                        backgroundColor="#181818"
                        textColor="#ffffff"
                        strokeColor="#181818"
                        className="mt-5"
                      />
                    </div>
                  </motion.article>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="border-y border-line py-5 text-sm text-ink-soft">{lang === 'ru' ? 'Афиша скоро обновится.' : 'Programme will be updated soon.'}</div>
      )}
    </section>
  );
}
