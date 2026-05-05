import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Event } from '../types';
import { RevealItem, RevealList, RevealSection } from './Reveal';
import ActionButton from './ActionButton';

interface EventsCProps {
  events?: Event[];
  showAll?: boolean;
}

export default function EventsC({ events: propEvents, showAll = false }: EventsCProps) {
  const { lang, content } = useSite();
  const events = propEvents ?? content?.events ?? [];
  const displayed = showAll ? events : events.slice(0, 3);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <RevealSection className="px-6 md:px-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Весна–Лето 2026 · ' : 'Spring–Summer 2026 · '}
            {events.length} {lang === 'ru' ? 'событий' : 'events'}
          </div>
          <h2 className="font-heading text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{lang === 'ru' ? 'Афиша' : 'Programme'}</h2>
        </div>
        <div>
          <ActionButton to="/events" text={`${lang === 'ru' ? 'Все события' : 'All events'} →`} />
        </div>
      </div>

      <RevealList className="grid gap-3 md:grid-cols-3">
        {displayed.map((event, i) => (
          <RevealItem key={event.id}>
            <Link
              to={`/events/${event.id}`}
              className="flex min-h-full flex-col gap-4 border border-line bg-white p-4 transition duration-200 ease-ds hover:-translate-y-1 hover:border-ink/25"
            >
              <div className="flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <span>N° 0{i + 1} / 0{displayed.length}</span>
                <span>{l(event.tag).toUpperCase()}</span>
              </div>

              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-paper">
                {event.image ? (
                  <img className="h-full w-full object-cover" src={event.image} alt={l(event.title)} />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">[ {l(event.title).toUpperCase().slice(0, 20)} ]</div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <h3 className="font-heading text-[clamp(30px,3vw,48px)] font-semibold uppercase leading-[0.92] tracking-[-0.04em]">{l(event.title)}</h3>
                <div className="text-sm leading-6 text-ink-soft">
                  {l(event.hall)} · {l(event.tag)}
                </div>
                <div className="mt-auto flex flex-wrap justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  <span>{l(event.date)}</span>
                  <span>{event.weekday[lang]} · {event.time}</span>
                  <span>{lang === 'ru' ? 'Билет' : 'Ticket'} {l(event.price)}</span>
                </div>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealList>
    </RevealSection>
  );
}
