import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import type { Event } from '../types';
import { getEvent } from '../api/client';
import { PageKicker } from '../components/PageKicker';
import Seo, { SITE_NAME, SITE_URL } from '../components/Seo';
import ActionButton from '../components/ActionButton';
import { formatDayMonthFromEvent } from '../lib/eventDates';

function mediaUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, content } = useSite();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!id) return;
    const fromCache = content?.events.find((e) => e.id === Number(id));
    if (fromCache) {
      setEvent(fromCache);
      return;
    }
    getEvent(Number(id)).then(setEvent).catch(() => {});
  }, [id, content]);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  if (!event) {
    return (
      <div className="px-5 pt-28 text-sm text-muted md:px-12 md:pt-32">
        {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  const dayHeader = formatDayMonthFromEvent(event, lang);
  const descParas = l(event.description).split('\n').map((s) => s.trim()).filter(Boolean);

  // Похожие события: тот же жанр, кроме текущего, до 3.
  const related = (content?.events ?? [])
    .filter((e) => e.id !== event.id && e.tag.ru === event.tag.ru)
    .slice(0, 3);

  const seoDesc =
    descParas[0]?.slice(0, 220) ||
    (lang === 'ru'
      ? `${l(event.title)} — ${l(event.date)}, ${l(event.hall)}. ${SITE_NAME}, Москва.`
      : `${l(event.title)} — ${l(event.date)}, ${l(event.hall)}. ${SITE_NAME}, Moscow.`);
  const seoImage = event.image ? mediaUrl(event.image) : undefined;

  return (
    <>
      <Seo
        title={`${l(event.title)} — ${l(event.date)} · ${SITE_NAME}`}
        description={seoDesc}
        path={`events/${event.id}`}
        image={seoImage}
        type="event"
        lang={lang}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: l(event.title),
          startDate: l(event.date),
          description: seoDesc,
          image: seoImage ? (seoImage.startsWith('http') ? seoImage : `${SITE_URL}${seoImage}`) : undefined,
          location: {
            '@type': 'Place',
            name: `${SITE_NAME}, ${l(event.hall)}`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Большая Дмитровка, 1',
              addressLocality: 'Москва',
              addressCountry: 'RU',
            },
          },
          organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          url: `${SITE_URL}/events/${event.id}`,
        }}
      />
      <header className="border-b border-line bg-paper px-5 pb-10 pt-28 md:px-12 md:pb-14 md:pt-32">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <PageKicker>
              <Link to="/">{lang === 'ru' ? 'Главная' : 'Home'}</Link>
              {' · '}
              <Link to="/events">{lang === 'ru' ? 'Афиша' : 'Programme'}</Link>
              {' · '}
              <span>{l(event.tag)}</span>
            </PageKicker>
            <h1 className="font-heading text-[clamp(44px,7vw,104px)] font-bold uppercase leading-[0.9] tracking-[0.03em] text-ink">
              {l(event.title)}
            </h1>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {lang === 'ru' ? 'Дата' : 'Date'}
            </div>
            <div className="mt-2 font-heading text-[clamp(22px,3vw,36px)] font-bold tabular-nums text-ink">{dayHeader}</div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1600px] gap-10 px-5 py-12 md:px-12 lg:grid-cols-[1.1fr_380px] lg:gap-14">
        {/* Фото — как в новости: на всю ширину, без полей */}
        <div className="w-full overflow-hidden border border-line bg-paper-soft">
          {event.image ? (
            <img
              src={mediaUrl(event.image)}
              alt={l(event.title)}
              loading="lazy"
              decoding="async"
              className="max-h-[640px] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center p-6 text-center font-heading text-2xl font-bold uppercase tracking-[0.04em] text-muted">
              {l(event.title)}
            </div>
          )}
        </div>

        <aside className="flex flex-col justify-center gap-6 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {lang === 'ru' ? 'Когда' : 'When'}
              </dt>
              <dd className="mt-1 text-ink-soft">
                {l(event.date)} · {l(event.weekday)} · {event.time}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {lang === 'ru' ? 'Зал' : 'Hall'}
              </dt>
              <dd className="mt-1 text-ink-soft">{l(event.hall)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {lang === 'ru' ? 'Категория' : 'Category'}
              </dt>
              <dd className="mt-1 text-ink-soft">{l(event.tag)}</dd>
            </div>
            {event.age_rating ? (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  {lang === 'ru' ? 'Возраст' : 'Age'}
                </dt>
                <dd className="mt-1 text-ink-soft">{event.age_rating}</dd>
              </div>
            ) : null}
          </dl>
          {event.has_ticket && event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 max-w-fit items-center justify-center rounded-full bg-accent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition hover:bg-accent-deep"
            >
              {lang === 'ru' ? 'Купить билет' : 'Buy tickets'} →
            </a>
          ) : null}
          <ActionButton to="/events" text={lang === 'ru' ? 'Вся афиша' : 'Full programme'} />
        </aside>
      </section>

      {/* Описание программы */}
      {descParas.length > 0 ? (
        <section className="border-t border-line px-5 py-14 md:px-12">
          <div className="mx-auto max-w-[820px]">
            <PageKicker>{lang === 'ru' ? 'О программе' : 'About the programme'}</PageKicker>
            <div className="space-y-5 text-[16px] leading-[1.7] text-ink-soft">
              {descParas.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Похожие события */}
      {related.length > 0 ? (
        <section className="border-t border-line bg-paper px-5 py-16 md:px-12">
          <div className="mx-auto max-w-[1600px]">
            <h2 className="mb-10 font-heading text-[clamp(28px,4vw,56px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
              {lang === 'ru' ? 'Похожие события' : 'Related events'}
            </h2>
            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {related.map((ev) => (
                <Link key={ev.id} to={`/events/${ev.id}`} className="group flex flex-col">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-soft">
                    {ev.image ? (
                      <img
                        src={mediaUrl(ev.image)}
                        alt={l(ev.title)}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3 border-b border-ink pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft">
                    <span>{l(ev.tag)}</span>
                    <span className="tabular-nums">{formatDayMonthFromEvent(ev, lang)}</span>
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-bold uppercase leading-[1.1] tracking-[0.02em] text-ink transition group-hover:text-accent">
                    {l(ev.title)}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Липкая панель покупки (мобайл) */}
      {event.has_ticket && event.ticket_url ? (
        <div className="sticky bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-paper-soft/95 px-5 py-3 backdrop-blur-sm md:hidden">
          <div className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
            {l(event.title)}
          </div>
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper transition hover:bg-accent-deep"
          >
            {lang === 'ru' ? 'Купить билет' : 'Buy tickets'}
          </a>
        </div>
      ) : null}
    </>
  );
}
