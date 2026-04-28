import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Event } from '../types';

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
    <section className="events-c">
      <div className="section-head">
        <div>
          <div className="kicker mono">
            {lang === 'ru' ? 'Весна–Лето 2026 · ' : 'Spring–Summer 2026 · '}
            {events.length} {lang === 'ru' ? 'событий' : 'events'}
          </div>
          <h2 className="serif">{lang === 'ru' ? 'Афиша' : 'Programme'}</h2>
        </div>
        <div className="r">
          <Link to="/events" className="btn">
            {lang === 'ru' ? 'ВСЕ СОБЫТИЯ' : 'ALL EVENTS'} →
          </Link>
        </div>
      </div>

      <div className="events-c-grid">
        {displayed.map((event, i) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="event-card"
          >
            <div className="event-card-idx mono">
              <span>N° 0{i + 1} / 0{displayed.length}</span>
              <span>{l(event.tag).toUpperCase()}</span>
            </div>

            <div className="event-poster ph-img">
              {event.image ? (
                <img src={event.image} alt={l(event.title)} />
              ) : (
                <div className="ph-label">[ {l(event.title).toUpperCase().slice(0, 20)} ]</div>
              )}
            </div>

            <div className="event-card-body">
              <h3 className="event-title serif">{l(event.title)}</h3>
              <div className="event-info">
                {l(event.hall)} · {l(event.tag)}
              </div>
              <div className="event-dt mono">
                <span>{l(event.date)}</span>
                <span>{event.weekday[lang]} · {event.time}</span>
                <span>{lang === 'ru' ? 'Билет' : 'Ticket'} {l(event.price)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
