import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { Event } from '../types';
import { getEvent } from '../api/client';
import Reveal, { RevealSection } from '../components/Reveal';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, content } = useSite();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!id) return;
    const fromCache = content?.events.find((e) => e.id === Number(id));
    if (fromCache) { setEvent(fromCache); return; }
    getEvent(Number(id)).then(setEvent).catch(() => {});
  }, [id, content]);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  if (!event) {
    return <div className="block">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</div>;
  }

  return (
    <>
      <RevealSection className="page-title">
        <div>
          <div className="crumb mono">
            <Link to="/">{lang === 'ru' ? 'Главная' : 'Home'}</Link>
            {' · '}
            <Link to="/events">{lang === 'ru' ? 'Афиша' : 'Programme'}</Link>
            {' · '}
            {lang === 'ru' ? 'Событие' : 'Event'}
          </div>
          <h1 className="serif event-detail-title">{l(event.title)}</h1>
        </div>
        <div className="event-detail-meta">
          <dl className="event-detail-dl mono">
            <dt>{lang === 'ru' ? 'Дата' : 'Date'}</dt>
            <dd>{l(event.date)} · {l(event.weekday)} · {event.time}</dd>
            <dt>{lang === 'ru' ? 'Зал' : 'Hall'}</dt>
            <dd>{l(event.hall)}</dd>
            <dt>{lang === 'ru' ? 'Жанр' : 'Genre'}</dt>
            <dd>{l(event.tag)}</dd>
            <dt>{lang === 'ru' ? 'Билеты' : 'Tickets'}</dt>
            <dd>{l(event.price)}</dd>
          </dl>
          <div className="event-detail-cta">
            <Link to="/events" className="btn solid">
              {lang === 'ru' ? 'КУПИТЬ БИЛЕТ' : 'BUY TICKET'} →
            </Link>
            <Link to="/events" className="btn">
              {lang === 'ru' ? 'ВСЯ АФИША' : 'FULL PROGRAMME'}
            </Link>
          </div>
        </div>
      </RevealSection>

      <Reveal className="event-detail-body">
        <div className="ph-img event-detail-poster">
          {event.image ? (
            <img src={event.image} alt={l(event.title)} />
          ) : (
            <div className="ph-label">[ {l(event.title).toUpperCase()} ]</div>
          )}
        </div>
        <div className="event-detail-content">
          <div className="event-detail-label mono">
            {lang === 'ru' ? 'Описание' : 'About'}
          </div>
          <p className="event-detail-desc">{l(event.description) || (lang === 'ru' ? 'Описание скоро появится.' : 'Description coming soon.')}</p>
        </div>
      </Reveal>
    </>
  );
}
