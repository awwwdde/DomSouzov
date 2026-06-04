import { Link } from 'react-router-dom';
import type { Event } from '../types';
import { useReducedMotionActive } from '../lib/motion';

function TagDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
      <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      {label}
    </span>
  );
}

/** Горизонтальная полоса события (design.md §3.2). */
export function EventRowStrip({
  event,
  lang,
  dayMonth,
}: {
  event: Event;
  lang: 'ru' | 'en';
  dayMonth: string;
}) {
  const reduced = useReducedMotionActive();
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const title = l(event.title);

  return (
    <article className="group relative grid gap-0 border-b border-line bg-paper transition-colors hover:bg-paper-soft md:grid-cols-[minmax(0,280px)_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper-soft md:border-b-0 md:border-r md:border-line">
        {event.image ? (
          <img
            src={event.image}
            alt=""
            className={`h-full w-full object-cover ${reduced ? '' : 'transition-transform duration-[900ms] ease-ds group-hover:scale-[1.04]'}`}
          />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center p-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted">
            {l(event.tag)}
          </div>
        )}
      </div>

      <div className="pointer-events-none relative flex flex-col justify-center gap-5 p-5 md:p-8">
        <Link
          to={`/events/${event.id}`}
          className="absolute inset-0 z-0"
          aria-label={title}
        />
        <div className="relative z-[1] flex flex-wrap items-start justify-between gap-4">
          <TagDot label={l(event.tag)} />
          <span className="font-heading text-[clamp(22px,2.2vw,32px)] font-bold leading-none tracking-[0.01em] text-ink">
            {dayMonth}
          </span>
        </div>
        <h2 className="relative z-[1] font-heading text-[clamp(18px,2.2vw,28px)] font-bold uppercase leading-tight tracking-[0.04em] transition-colors duration-[900ms] ease-ds group-hover:underline group-hover:underline-offset-4 md:max-w-[40ch]">
          {title}
        </h2>
        <p className="relative z-[1] text-sm text-ink-soft">
          {l(event.hall)} · {event.time}
        </p>
        {event.has_ticket && event.ticket_url ? (
          <div className="relative z-[2]">
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto inline-flex min-h-11 items-center justify-center bg-accent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper"
            >
              {lang === 'ru' ? 'Купить билет' : 'Buy tickets'} →
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function EventStripList({
  events,
  lang,
  getDayMonth,
}: {
  events: Event[];
  lang: 'ru' | 'en';
  getDayMonth: (e: Event) => string;
}) {
  if (!events.length) {
    return (
      <p className="border-b border-line py-10 text-center text-sm text-muted">
        {lang === 'ru' ? 'Нет событий по выбранным фильтрам.' : 'No events match the filters.'}
      </p>
    );
  }
  return (
    <div className="border-t border-line">
      {events.map((e) => (
        <EventRowStrip key={e.id} event={e} lang={lang} dayMonth={getDayMonth(e)} />
      ))}
    </div>
  );
}
