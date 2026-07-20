import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import type { Event } from '../types';
import { getEvent } from '../api/client';
import { PageKicker } from '../components/PageKicker';
import Seo, { SITE_NAME, SITE_URL } from '../components/Seo';
import ActionButton from '../components/ActionButton';
import { formatDayMonthFromEvent } from '../lib/eventDates';
import { parseContentBlocks, firstTextBlock } from '../lib/richText';

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
  const descBlocks = parseContentBlocks(l(event.description));

  // Похожие события: тот же жанр, кроме текущего, до 3.
  const related = (content?.events ?? [])
    .filter((e) => e.id !== event.id && e.tag.ru === event.tag.ru)
    .slice(0, 3);

  const seoDesc =
    firstTextBlock(descBlocks).slice(0, 220) ||
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
        keywords={[l(event.tag), l(event.hall), l(event.title), 'афиша', 'купить билет', 'концерт Москва']}
        articleTags={[l(event.tag), l(event.hall)]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: l(event.title),
            startDate: l(event.date),
            ...(event.dates && event.dates.length > 1
              ? { endDate: lang === 'ru' ? event.dates[event.dates.length - 1].date : event.dates[event.dates.length - 1].date_en }
              : {}),
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            description: seoDesc,
            image: seoImage ? (seoImage.startsWith('http') ? seoImage : `${SITE_URL}${seoImage}`) : undefined,
            location: {
              '@type': 'Place',
              name: `${SITE_NAME}, ${l(event.hall)}`,
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Большая Дмитровка, 1',
                addressLocality: 'Москва',
                postalCode: '125009',
                addressCountry: 'RU',
              },
              geo: { '@type': 'GeoCoordinates', latitude: '55.7596', longitude: '37.6156' },
            },
            organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            performer: { '@type': 'Organization', name: SITE_NAME },
            ...(event.has_ticket && event.ticket_url
              ? { offers: { '@type': 'Offer', url: event.ticket_url, availability: 'https://schema.org/InStock' } }
              : {}),
            url: `${SITE_URL}/events/${event.id}`,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: lang === 'ru' ? 'Главная' : 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: lang === 'ru' ? 'Афиша' : 'Programme', item: `${SITE_URL}/events` },
              { '@type': 'ListItem', position: 3, name: l(event.title), item: `${SITE_URL}/events/${event.id}` },
            ],
          },
        ]}
      />
      {/* Отступы задаём ВНУТРИ центрированного контейнера max-w-[1600px], а не
          на секции: иначе на экранах шире 1600px левый край заголовка и текста
          не совпадал с краем фото ниже (у той секции max-w и padding на одном
          элементе). Разъезд был ровно на величину padding — 48px. */}
      <header className="border-b border-line bg-paper pb-10 pt-28 md:pb-14 md:pt-32">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-5 md:flex-row md:items-start md:justify-between md:px-12">
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

      <section className="mx-auto grid w-full max-w-[1600px] gap-10 px-5 py-12 md:px-12 lg:grid-cols-[1.6fr_320px] lg:items-start lg:gap-12">
        {/* Фото — во всю ширину колонки, пропорционально, без обрезки */}
        <div className="w-full">
          {event.image ? (
            <img
              src={mediaUrl(event.image)}
              alt={l(event.title)}
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-paper-soft p-6 text-center font-heading text-2xl font-bold uppercase tracking-[0.04em] text-muted">
              {l(event.title)}
            </div>
          )}
        </div>

        <aside className="flex flex-col justify-center gap-6 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {event.dates && event.dates.length > 1
                  ? lang === 'ru' ? 'Расписание сеансов' : 'Schedule'
                  : lang === 'ru' ? 'Когда' : 'When'}
              </dt>
              {event.dates && event.dates.length > 1 ? (
                (() => {
                  // Уникальные даты по порядку + их наборы времён.
                  const groups: { date: string; times: string[] }[] = [];
                  event.dates.forEach((o) => {
                    const d = lang === 'ru' ? o.date : (o.date_en || o.date);
                    const g = groups.find((x) => x.date === d);
                    if (g) { if (!g.times.includes(o.time)) g.times.push(o.time); }
                    else groups.push({ date: d, times: [o.time] });
                  });
                  // Одинаковый ли набор времён у всех дней.
                  const sig = (t: string[]) => [...t].sort().join(',');
                  const uniform = groups.every((g) => sig(g.times) === sig(groups[0].times));

                  // Кубик даты: «25 ДЕК 2026» → день + месяц.
                  const Tile = ({ date }: { date: string }) => {
                    const m = date.match(/(\d{1,2})\s+(\S+)/);
                    return (
                      <div className="flex min-w-[54px] flex-col items-center justify-center rounded-lg bg-accent px-2 py-2 text-paper">
                        <span className="text-[16px] font-bold leading-none tabular-nums">{m ? m[1] : date}</span>
                        {m ? <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-paper/85">{m[2]}</span> : null}
                      </div>
                    );
                  };
                  const Tiles = ({ dates }: { dates: string[] }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {dates.map((d, i) => <Tile key={`${d}-${i}`} date={d} />)}
                    </div>
                  );
                  const Chips = ({ times }: { times: string[] }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {times.map((tm, j) => (
                        <span key={`${tm}-${j}`} className="rounded-full border border-line px-2.5 py-1 text-[12px] font-semibold tabular-nums text-ink">
                          {tm}
                        </span>
                      ))}
                    </div>
                  );

                  if (uniform) {
                    return (
                      <dd className="mt-2 grid gap-3 text-ink-soft">
                        <Tiles dates={groups.map((g) => g.date)} />
                        <Chips times={groups[0].times} />
                      </dd>
                    );
                  }

                  // Времена различаются — группируем даты по одинаковому набору времён.
                  const bySig: { s: string; dates: string[]; times: string[] }[] = [];
                  groups.forEach((g) => {
                    const s = sig(g.times);
                    const b = bySig.find((x) => x.s === s);
                    if (b) b.dates.push(g.date);
                    else bySig.push({ s, dates: [g.date], times: g.times });
                  });
                  return (
                    <dd className="mt-2 grid gap-4 text-ink-soft">
                      {bySig.map((b, i) => (
                        <div key={b.s || i} className="grid gap-2 border-b border-line/60 pb-4 last:border-0 last:pb-0">
                          <Tiles dates={b.dates} />
                          <Chips times={b.times} />
                        </div>
                      ))}
                    </dd>
                  );
                })()
              ) : (
                <dd className="mt-1 text-ink-soft">
                  {l(event.date)} · {l(event.weekday)} · {event.time}
                </dd>
              )}
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
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition hover:bg-accent-deep"
            >
              {lang === 'ru' ? 'Купить билет' : 'Buy tickets'} →
            </a>
          ) : null}
          <ActionButton to="/events" text={lang === 'ru' ? 'Вся афиша' : 'Full programme'} className="w-full" />
        </aside>
      </section>

      {/* Описание программы — читаемая колонка, изображения аккуратно вписаны */}
      {descBlocks.length > 0 ? (
        <section className="border-t border-line py-14 md:py-20">
          <div className="mx-auto w-full max-w-[1600px] px-5 md:px-12">
            <PageKicker>{lang === 'ru' ? 'О программе' : 'About the programme'}</PageKicker>
            {/* Выключка по ширине — как в новостях: ровный правый край,
                без переносов, последняя строка выравнивается влево. */}
            <div
              lang={lang}
              className="mt-8 max-w-[900px] space-y-6 text-justify text-[17px] leading-[1.8] text-ink-soft [hyphens:none] [text-align-last:start]"
            >
              {descBlocks.map((b, i) =>
                b.type === 'image' ? (
                  <figure key={i} className="my-9">
                    <img
                      src={mediaUrl(b.url)}
                      alt={b.alt}
                      loading="lazy"
                      decoding="async"
                      className="mx-auto h-auto w-full max-w-[560px] rounded-lg"
                    />
                    {b.alt ? (
                      <figcaption className="mt-3 text-center text-[13px] text-muted">{b.alt}</figcaption>
                    ) : null}
                  </figure>
                ) : (
                  <p key={i}>{b.value}</p>
                )
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Похожие события */}
      {related.length > 0 ? (
        <section className="border-t border-line bg-paper py-16">
          <div className="mx-auto w-full max-w-[1600px] px-5 md:px-12">
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
