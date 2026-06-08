import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import type { Event, EventGalleryImage } from '../types';
import { getEvent } from '../api/client';
import { PageKicker } from '../components/PageKicker';
import Seo, { SITE_NAME, SITE_URL } from '../components/Seo';
import ActionButton from '../components/ActionButton';
import Lightbox, { type LightboxItem } from '../components/Lightbox';
import { formatDayMonthFromEvent } from '../lib/eventDates';
import { maskLineReveal, transitionBase, useReducedMotionActive } from '../lib/motion';

function mediaUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, content } = useSite();
  const [event, setEvent] = useState<Event | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const reduced = useReducedMotionActive();

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

  const galleryItems = event?.gallery ?? [];

  const lightboxSlides: LightboxItem[] = useMemo(() => {
    if (!event) return [];
    return galleryItems.map((img) => {
      const caption = img.caption ? l(img.caption) : undefined;
      return {
        src: mediaUrl(img.image),
        alt: caption || l(event.title),
        caption,
      };
    });
  }, [event, galleryItems, lang]);

  const lead =
    event && l(event.description).trim()
      ? (l(event.description).split('\n')[0]?.slice(0, 220) ?? '')
      : '';

  const openLightboxAt = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  if (!event) {
    return (
      <div className="px-5 pt-28 text-sm text-muted md:px-12 md:pt-32">
        {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  const dayHeader = formatDayMonthFromEvent(event, lang);

  const seoTitle = `${l(event.title)} — ${l(event.date)} · ${SITE_NAME}`;
  const seoDesc =
    lead ||
    (lang === 'ru'
      ? `${l(event.title)} — ${l(event.date)}, ${l(event.hall)}. ${SITE_NAME}, Москва.`
      : `${l(event.title)} — ${l(event.date)}, ${l(event.hall)}. ${SITE_NAME}, Moscow.`);
  const seoImage = event.image ? mediaUrl(event.image) : undefined;

  return (
    <>
      <Seo
        title={seoTitle}
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
              <span>{lang === 'ru' ? 'Событие' : 'Event'}</span>
            </PageKicker>
            <h1 className="font-heading text-[clamp(52px,9vw,124px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
              {l(event.title)}
            </h1>
            {lead ? <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg">{lead}</p> : null}
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {lang === 'ru' ? 'Дата' : 'Date'}
            </div>
            <div className="mt-2 font-heading text-[clamp(22px,3vw,36px)] font-bold tabular-nums text-ink">{dayHeader}</div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1600px] gap-10 px-5 py-12 md:grid-cols-[1fr_360px] md:gap-14 md:px-12 lg:grid-cols-[1.1fr_380px]">
        <div className="aspect-[4/3] w-full overflow-hidden border border-line bg-paper-soft">
          {event.image ? (
            <img src={mediaUrl(event.image)} alt={l(event.title)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center p-6 text-center text-sm text-muted">
              {l(event.title)}
            </div>
          )}
        </div>

        <aside className="flex flex-col justify-center gap-6 border-t border-line pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0">
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
                {lang === 'ru' ? 'Жанр' : 'Genre'}
              </dt>
              <dd className="mt-1 text-ink-soft">{l(event.tag)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {lang === 'ru' ? 'Билеты' : 'Tickets'}
              </dt>
              <dd className="mt-1 text-ink-soft">{l(event.price)}</dd>
            </div>
          </dl>
          {event.has_ticket && event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 max-w-fit items-center justify-center bg-accent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition hover:opacity-90"
            >
              {lang === 'ru' ? 'Купить билет' : 'Buy tickets'} →
            </a>
          ) : null}
          <ActionButton to="/events" text={lang === 'ru' ? 'Вся афиша' : 'Full programme'} />
        </aside>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-12">
        <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:gap-16">
          <div className="space-y-8">
            {galleryItems.length > 0 ? (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  {lang === 'ru' ? 'Галерея' : 'Gallery'}
                </div>
                {galleryItems.map((img: EventGalleryImage, gi: number) => (
                  <motion.button
                    key={img.id}
                    type="button"
                    className="block w-full overflow-hidden border border-line bg-paper text-left"
                    onClick={() => openLightboxAt(gi)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    variants={maskLineReveal(reduced)}
                    transition={reduced ? { duration: 0 } : { ...transitionBase, delay: gi * 0.15 }}
                  >
                    <img
                      src={mediaUrl(img.image)}
                      alt={img.caption ? l(img.caption) : l(event.title)}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </motion.button>
                ))}
              </>
            ) : (
              <div className="border border-dashed border-line bg-paper p-8 text-center text-sm text-muted">
                {lang === 'ru' ? 'Дополнительные фотографии появятся позже.' : 'More photographs will be added later.'}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <PageKicker>{lang === 'ru' ? 'О программе' : 'About the programme'}</PageKicker>
            <div className="max-w-prose space-y-5 text-[15px] leading-[1.65] text-ink-soft">
              {l(event.description)
                .split('\n')
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </aside>
        </div>
      </section>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={lightboxSlides}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
