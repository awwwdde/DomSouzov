import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { Event } from '../types';
import { getEvent } from '../api/client';
import Reveal, { RevealSection } from '../components/Reveal';
import ActionButton from '../components/ActionButton';

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
    return <div className="px-6 pt-28 text-sm text-muted md:px-12">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</div>;
  }

  return (
    <>
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.2fr_0.8fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            <Link to="/">{lang === 'ru' ? 'Главная' : 'Home'}</Link>
            {' · '}
            <Link to="/events">{lang === 'ru' ? 'Афиша' : 'Programme'}</Link>
            {' · '}
            {lang === 'ru' ? 'Событие' : 'Event'}
          </div>
          <h1 className="font-heading text-[clamp(54px,8vw,124px)] font-semibold uppercase leading-[0.84] tracking-[-0.06em]">{l(event.title)}</h1>
        </div>
        <div className="self-end">
          <dl className="grid grid-cols-[90px_1fr] gap-x-5 gap-y-2 text-xs uppercase tracking-[0.08em]">
            <dt>{lang === 'ru' ? 'Дата' : 'Date'}</dt>
            <dd className="text-ink-soft">{l(event.date)} · {l(event.weekday)} · {event.time}</dd>
            <dt>{lang === 'ru' ? 'Зал' : 'Hall'}</dt>
            <dd className="text-ink-soft">{l(event.hall)}</dd>
            <dt>{lang === 'ru' ? 'Жанр' : 'Genre'}</dt>
            <dd className="text-ink-soft">{l(event.tag)}</dd>
            <dt>{lang === 'ru' ? 'Билеты' : 'Tickets'}</dt>
            <dd className="text-ink-soft">{l(event.price)}</dd>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton to="/events" text={`${lang === 'ru' ? 'Купить билет' : 'Buy ticket'} →`} backgroundColor="#181818" textColor="#ffffff" strokeColor="#181818" />
            <ActionButton to="/events" text={lang === 'ru' ? 'Вся афиша' : 'Full programme'} />
          </div>
        </div>
      </RevealSection>

      <Reveal className="grid gap-8 px-6 md:grid-cols-[0.9fr_1.1fr] md:px-12">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-paper">
          {event.image ? (
            <img className="h-full w-full object-cover" src={event.image} alt={l(event.title)} />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm font-bold uppercase tracking-[0.14em] text-muted">[ {l(event.title).toUpperCase()} ]</div>
          )}
        </div>
        <div className="self-start">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Описание' : 'About'}
          </div>
          <p className="max-w-3xl text-xl leading-9 text-ink-soft">{l(event.description) || (lang === 'ru' ? 'Описание скоро появится.' : 'Description coming soon.')}</p>
        </div>
      </Reveal>
    </>
  );
}
