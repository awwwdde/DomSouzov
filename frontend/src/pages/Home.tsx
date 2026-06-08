import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ActionButton from '../components/ActionButton';
import Seo, { SITE_NAME, SITE_URL } from '../components/Seo';
import Marquee from '../components/Marquee';
import PartnersSection from '../components/PartnersSection';
import { Container, Section } from '../components/Section';
import { RevealItem, RevealList } from '../components/Reveal';
import { DURATION, transitionBase, useReducedMotionActive } from '../lib/motion';
import { formatDayMonthFromEvent, sortEventsByDate } from '../lib/eventDates';
import { pickHomeEvents, pickHomeNews } from '../lib/homePick';
import { useSite } from '../context/SiteContext';
import type { Event, NewsArticle } from '../types';

const MotionLink = motion(Link);

/* ============================================================ */
/* HOME — главная Дома Союзов, editorial-premium (ZILART-style). */
/* Структура сцен:                                              */
/*  1. Hero — full-bleed видео/постер, без огромного H1.        */
/*  2. Intro thesis — центрированная uppercase-цитата + CTA.    */
/*  3. Афиша — заголовок + outline-кнопка, 3 крупные карточки.  */
/*  4. Плановый визит — 2-кол: текст+CTA / архивное фото.       */
/*  5. Новости — заголовок + сетка карточек 4 в ряд.            */
/*  6. Full-bleed баннер.                                        */
/*  7. Парные блоки «Организаторам / Зрителям» (commerce-style).*/
/*  8. Партнёры — чистая сетка логотипов.                       */
/* ============================================================ */

type RawItem = Record<string, unknown>;

const DEFAULT_MARQUEE: RawItem[] = [
  { text: { ru: 'Колонный зал', en: 'Hall of Columns' } },
  { text: { ru: 'С 1784 года', en: 'Since 1784' } },
  { text: { ru: 'Большая Дмитровка 1', en: 'Bolshaya Dmitrovka 1' } },
  { text: { ru: 'Культурная площадка Москвы', en: 'A cultural stage of Moscow' } },
];

export default function Home() {
  const { lang, content, t, list, pickItem } = useSite();
  const reduced = useReducedMotionActive();
  const events = content?.events ?? [];
  const news = content?.news ?? [];
  const partners = content?.partners ?? [];

  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');
  const ctaBg = t('cta_background_url');

  const sortedEvents = useMemo(() => sortEventsByDate(events, lang), [events, lang]);
  const homeEvents = useMemo(() => pickHomeEvents(sortedEvents, 6), [sortedEvents]);
  const homeNews = useMemo(() => pickHomeNews(news, 4), [news]);

  const marqueeItems = list<RawItem>('home_marquee', DEFAULT_MARQUEE)
    .map((m) => pickItem(m, 'text'))
    .filter(Boolean);

  const thesis = t('home_thesis') || (lang === 'ru'
    ? 'Дом Союзов — историческая концертная и церемониальная площадка в центре Москвы. Колонный зал работает с 1784 года: классические концерты, публичные дискуссии, торжественные церемонии и съёмки.'
    : 'House of Unions is a historic concert and ceremonial venue in the heart of Moscow. The Hall of Columns has operated since 1784: classical concerts, public discussions, ceremonies, and filming.');
  const planHeading = t('home_plan_heading') || (lang === 'ru' ? 'Спланировать визит' : 'Plan your visit');
  const planBody = t('home_plan_body') || (lang === 'ru'
    ? 'Большая Дмитровка 1, в трёх минутах от метро «Охотный ряд». Колонный, Октябрьский и Малый залы открыты для концертов, церемоний, лекций и съёмок. Билеты — через афишу, аренда — по запросу.'
    : 'Bolshaya Dmitrovka 1, three minutes from Okhotny Ryad metro. The Hall of Columns, the October and Small halls host concerts, ceremonies, lectures, and filming. Tickets via the programme; venue rental on request.');
  const organizersBody = t('home_organizers_body') || (lang === 'ru'
    ? 'Аренда Колонного, Октябрьского и Малого залов под концерты, церемонии, форумы и съёмки. Сопровождение и техническое обеспечение.'
    : 'Rent the Hall of Columns and the October and Small halls for concerts, ceremonies, forums, and filming. Full production support.');
  const visitorsBody = t('home_visitors_body') || (lang === 'ru'
    ? 'Афиша концертов и публичных программ, информация о посещении, доступная среда и экскурсии по историческим залам.'
    : 'Programme of concerts and public events, visitor information, accessibility, and guided tours of the historic halls.');

  return (
    <div className="w-full bg-paper">
      <Seo
        title={
          lang === 'ru'
            ? 'Дом Союзов — Колонный зал, Большая Дмитровка 1, Москва'
            : 'House of Unions — Hall of Columns, Moscow'
        }
        description={thesis}
        path=""
        lang={lang}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'PerformingArtsTheater',
          name: SITE_NAME,
          alternateName: 'House of Unions',
          url: SITE_URL,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Большая Дмитровка, 1',
            addressLocality: 'Москва',
            addressCountry: 'RU',
          },
        }}
      />
      {/* ============================================================ */}
      {/* 1. HERO — full-bleed медиа (или типографический fallback)     */}
      {/* ============================================================ */}
      <Section as="div" tone="paper" spacing="none" bleed>
        <div className="relative w-full overflow-hidden bg-ink">
          {heroVideo ? (
            <video
              className="block h-[78vh] max-h-[860px] min-h-[520px] w-full object-cover"
              src={heroVideo}
              poster={heroPoster || undefined}
              preload="metadata"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : heroPoster ? (
            <img
              src={heroPoster}
              alt=""
              className="block h-[78vh] max-h-[860px] min-h-[520px] w-full object-cover"
            />
          ) : (
            // Fallback: типографический hero на тёмном фоне с радиальным свечением.
            <div className="relative flex h-[78vh] max-h-[860px] min-h-[520px] w-full items-end justify-start overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(1200px 700px at 78% 18%, rgba(47,93,80,0.55), transparent 60%), radial-gradient(900px 500px at 12% 92%, rgba(247,247,242,0.10), transparent 55%), #141413',
                }}
                aria-hidden
              />
              <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" aria-hidden style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
              <div className="relative mx-auto flex h-full w-full md:w-[95%] max-w-[1800px] flex-col justify-end px-5 pb-12 md:px-6 md:pb-16">
                <span className="mb-6 inline-flex items-baseline gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-paper/65">
                  <span className="text-paper/40">— —</span>
                  {lang === 'ru' ? 'Колонный зал · Большая Дмитровка' : 'Hall of Columns · Bolshaya Dmitrovka'}
                </span>
                <motion.h1
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : DURATION.slow, ease: transitionBase.ease }}
                  className="font-heading text-[clamp(64px,11vw,180px)] font-bold uppercase leading-[0.86] tracking-[-0.01em] text-paper"
                >
                  {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
                </motion.h1>
                <p className="mt-8 max-w-[44ch] text-sm leading-7 text-paper/70 md:text-base">
                  {lang === 'ru'
                    ? 'Колонный зал, концерты, церемонии и публичные программы на Большой Дмитровке.'
                    : 'The Hall of Columns, concerts, ceremonies, and public programmes on Bolshaya Dmitrovka.'}
                </p>
              </div>
            </div>
          )}

        </div>
      </Section>

      {/* ============================================================ */}
      {/* 2. INTRO THESIS — центрированная цитата + CTA                 */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="sm" bordered>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0 : DURATION.slow, ease: transitionBase.ease }}
          className="mx-auto flex max-w-6xl flex-col items-center text-center"
        >
          <blockquote className="font-heading text-[clamp(20px,2.2vw,32px)] font-bold uppercase leading-[1.2] tracking-[0.01em] text-ink">
            {thesis}
          </blockquote>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <ActionButton
              to="/events"
              text={lang === 'ru' ? 'Билеты и афиша' : 'Tickets & programme'}
              backgroundColor="#0a0a0a"
              textColor="#f0ebe0"
              strokeColor="#0a0a0a"
            />
            <ActionButton
              to="/about"
              text={lang === 'ru' ? 'Больше о Доме' : 'About the House'}
              backgroundColor="transparent"
              textColor="#0a0a0a"
              strokeColor="#0a0a0a"
            />
          </div>
        </motion.div>
      </Section>

      {/* ============================================================ */}
      {/* MARQUEE                                                       */}
      {/* ============================================================ */}
      <Marquee
        items={marqueeItems}
        variant="dark"
        duration={28}
        aria-label={lang === 'ru' ? 'Анонс' : 'Highlights'}
      />

      {/* ============================================================ */}
      {/* 3. АФИША — крупные карточки editorial-style                   */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="md" bordered>
        <EditorialHeading
          title={lang === 'ru' ? 'Афиша' : 'Programme'}
          actionTo="/events"
          actionText={lang === 'ru' ? 'Все события' : 'All events'}
          size="display"
        />

        {homeEvents.length === 0 ? (
          <EmptyEditorialState
            label={lang === 'ru' ? 'Сезон формируется' : 'Programme in preparation'}
            body={
              lang === 'ru'
                ? 'Афиша Колонного зала на ближайшие месяцы готовится. Подпишитесь, чтобы получить анонс концертов и церемоний первыми.'
                : 'The Hall of Columns programme for the coming months is being prepared. Subscribe to be the first to receive announcements.'
            }
          />
        ) : (
          <EditorialCardGrid items={homeEvents} type="event" lang={lang} reduced={reduced} />
        )}
      </Section>

      {/* ============================================================ */}
      {/* 4. PLAN VISIT — 2 колонки: текст + архивное фото              */}
      {/* ============================================================ */}
      <Section tone="paper-soft" spacing="lg" bordered>
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6 lg:col-span-5 flex flex-col">
            <h2 className="font-heading text-[clamp(40px,5vw,80px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
              {planHeading}
            </h2>
            <p className="mt-8 max-w-[58ch] text-base leading-7 text-ink-soft">{planBody}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ActionButton
                to="/contacts"
                text={lang === 'ru' ? 'Как добраться' : 'How to get there'}
                backgroundColor="#0a0a0a"
                textColor="#f0ebe0"
                strokeColor="#0a0a0a"
              />
              <ActionButton
                to="/organizers"
                text={lang === 'ru' ? 'Аренда залов' : 'Rent a hall'}
                backgroundColor="transparent"
                textColor="#0a0a0a"
                strokeColor="#0a0a0a"
              />
            </div>
          </div>

          <figure className="md:col-span-6 lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
              {ctaBg || heroPoster ? (
                <img
                  src={ctaBg || heroPoster}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                // Архитектурный fallback — концентрические колонны + лучи света.
                <div
                  className="relative h-full w-full"
                  aria-hidden
                  style={{
                    background:
                      'radial-gradient(800px 500px at 50% 110%, rgba(47,93,80,0.45), transparent 60%), linear-gradient(180deg, #1a1a18 0%, #0f0f0e 100%)',
                  }}
                >
                  {/* колонны */}
                  <div className="absolute inset-x-0 bottom-0 top-1/4 flex items-end justify-center gap-[6%] px-[10%]">
                    {[0.55, 0.7, 0.85, 1, 0.85, 0.7, 0.55].map((h, i) => (
                      <div
                        key={i}
                        className="w-[6%]"
                        style={{
                          height: `${h * 100}%`,
                          background: 'linear-gradient(180deg, rgba(247,247,242,0.18) 0%, rgba(247,247,242,0.04) 100%)',
                          borderTop: '2px solid rgba(247,247,242,0.22)',
                          borderBottom: '2px solid rgba(247,247,242,0.10)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="absolute left-1/2 top-6 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.3em] text-paper/55">
                    {lang === 'ru' ? 'Колонный зал' : 'Hall of Columns'}
                  </span>
                </div>
              )}
            </div>
          </figure>
        </div>
      </Section>

      {/* ============================================================ */}
      {/* 5. НОВОСТИ — сетка 4 в ряд                                    */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="md" bordered>
        <EditorialHeading
          title={lang === 'ru' ? 'Новости' : 'News'}
          actionTo="/news"
          actionText={lang === 'ru' ? 'Все материалы' : 'All stories'}
          size="standard"
        />

        {homeNews.length === 0 ? (
          <EmptyEditorialState
            label={lang === 'ru' ? 'Хроника' : 'Chronicle'}
            body={
              lang === 'ru'
                ? 'Свежие материалы редакции скоро появятся здесь. Заходите за новостями о премьерах и архитектурной истории Дома.'
                : 'Fresh editorial materials will appear here soon. Come back for news on premieres and the architectural history of the House.'
            }
          />
        ) : (
          <NewsGrid items={homeNews} lang={lang} reduced={reduced} />
        )}
      </Section>

      {/* ============================================================ */}
      {/* 6. FULL-BLEED BANNER                                          */}
      {/* ============================================================ */}
      {ctaBg ? (
        <Section as="div" tone="paper" spacing="none" bleed>
          <figure className="relative w-full overflow-hidden">
            <img
              src={ctaBg}
              alt=""
              className="block h-[44vh] max-h-[540px] min-h-[320px] w-full object-cover"
            />
          </figure>
        </Section>
      ) : null}

      {/* ============================================================ */}
      {/* 7. ПАРНЫЕ БЛОКИ — Организаторам / Зрителям                    */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="md" bordered>
        <div className="grid gap-12 md:grid-cols-2 md:gap-px md:bg-line">
          <InfoBlock
            index="01"
            kicker={lang === 'ru' ? 'Аренда' : 'Rental'}
            title={lang === 'ru' ? 'Организаторам' : 'For organizers'}
            body={organizersBody}
            ctaText={lang === 'ru' ? 'Запрос на аренду' : 'Request a rental'}
            ctaTo="/organizers"
          />
          <InfoBlock
            index="02"
            kicker={lang === 'ru' ? 'Посещение' : 'Visit'}
            title={lang === 'ru' ? 'Зрителям' : 'For visitors'}
            body={visitorsBody}
            ctaText={lang === 'ru' ? 'Афиша и билеты' : 'Programme & tickets'}
            ctaTo="/audience"
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/* 8. ПАРТНЁРЫ                                                   */}
      {/* ============================================================ */}
      <PartnersSection partners={partners} lang={lang} />
    </div>
  );
}

/* ============================================================ */
/* EditorialHeading — заголовок секции в духе ZILART:           */
/* H2 слева, outline-кнопка справа.                             */
/* ============================================================ */
function EditorialHeading({
  title,
  actionTo,
  actionText,
  size = 'standard',
}: {
  title: string;
  actionTo: string;
  actionText: string;
  size?: 'standard' | 'display';
}) {
  const titleClass =
    size === 'display'
      ? 'font-heading text-[clamp(48px,7vw,120px)] font-bold uppercase leading-[0.9] tracking-[0.01em] text-ink'
      : 'font-heading text-[clamp(36px,4.5vw,72px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink';

  return (
    <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-10">
      <h2 className={titleClass}>{title}</h2>
      <div className="shrink-0">
        <ActionButton
          to={actionTo}
          text={actionText}
          backgroundColor="transparent"
          textColor="#0a0a0a"
          strokeColor="#0a0a0a"
        />
      </div>
    </div>
  );
}

/* ============================================================ */
/* EditorialCardGrid — карточки афиши: дата → заголовок → фото. */
/* 3 в ряд на десктопе, 2 — md, 1 — мобайл.                     */
/* ============================================================ */
function EditorialCardGrid({
  items,
  type,
  lang,
  reduced,
}: {
  items: Event[];
  type: 'event';
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  void type;

  return (
    <RevealList className="grid gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
      {items.map((ev) => {
        const href = `/events/${ev.id}`;
        const title = l(ev.title);
        const tag = l(ev.tag);
        const date = formatDayMonthFromEvent(ev, lang);

        return (
          <RevealItem key={`event-${ev.id}`} y={16}>
            <MotionLink
              to={href}
              className="group flex h-full flex-col"
              variants={{ rest: {}, hover: {} }}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
                  {tag}
                </span>
                <span className="font-mono text-[clamp(18px,1.5vw,24px)] font-medium leading-none tabular-nums text-ink">
                  {date}
                </span>
              </div>
              <h3 className="mt-5 mb-6 font-heading text-[clamp(18px,1.35vw,22px)] font-black uppercase leading-[1.05] tracking-[0.01em] text-ink transition group-hover:underline group-hover:underline-offset-4">
                {title}
              </h3>
              <div className="relative mt-auto aspect-[4/5] w-full overflow-hidden">
                {ev.image ? (
                  <motion.img
                    src={ev.image}
                    alt={title}
                    className="h-full w-full object-cover"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: reduced ? 1 : 1.04 },
                    }}
                    transition={{
                      duration: reduced ? 0 : DURATION.slow,
                      ease: transitionBase.ease,
                    }}
                  />
                ) : (
                  <TicketStamp title={title} />
                )}
              </div>
            </MotionLink>
          </RevealItem>
        );
      })}
    </RevealList>
  );
}

/* ============================================================ */
/* NewsGrid — компактная сетка новостей 4 в ряд (как ЗИЛАРТ).   */
/* Карточка: заголовок + дата, без больших изображений.         */
/* ============================================================ */
function NewsGrid({
  items,
  lang,
  reduced,
}: {
  items: NewsArticle[];
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <RevealList className="grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {items.map((nw) => {
        const href = `/news/${nw.id}`;
        const title = l(nw.title);
        const tag = l(nw.tag);
        const date = formatNewsDate(nw, lang);

        return (
          <RevealItem key={`news-${nw.id}`} y={16}>
            <MotionLink
              to={href}
              className="group flex h-full flex-col"
              variants={{ rest: {}, hover: {} }}
              initial="rest"
              whileHover="hover"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-soft">
                {nw.image ? (
                  <motion.img
                    src={nw.image}
                    alt={title}
                    className="h-full w-full object-cover"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: reduced ? 1 : 1.04 },
                    }}
                    transition={{
                      duration: reduced ? 0 : DURATION.slow,
                      ease: transitionBase.ease,
                    }}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-end p-5"
                    aria-hidden
                    style={{
                      background:
                        'radial-gradient(600px 360px at 80% 20%, rgba(47,93,80,0.25), transparent 60%), linear-gradient(180deg, #1a1a18 0%, #0f0f0e 100%)',
                    }}
                  >
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-paper/60">
                      {tag}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3 border-b border-ink pb-3">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
                  {tag}
                </span>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft tabular-nums">
                  {date}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-[clamp(16px,1.15vw,19px)] font-bold uppercase leading-[1.25] tracking-[0.02em] text-ink transition group-hover:underline group-hover:underline-offset-4">
                {title}
              </h3>
            </MotionLink>
          </RevealItem>
        );
      })}
    </RevealList>
  );
}

/* ============================================================ */
/* InfoBlock — парный блок в духе ZILART «Магазин / Ресторан». */
/* ============================================================ */
function InfoBlock({
  index,
  kicker,
  title,
  body,
  ctaText,
  ctaTo,
}: {
  index: string;
  kicker: string;
  title: string;
  body: string;
  ctaText: string;
  ctaTo: string;
}) {
  return (
    <div className="flex flex-col bg-paper md:p-8 lg:p-10">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-soft">
          {kicker}
        </span>
        <span className="font-mono text-[11px] font-medium tabular-nums text-ink-soft">
          {index} / 02
        </span>
      </div>
      <h3 className="mt-6 font-heading text-[clamp(32px,3.6vw,56px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
        {title}
      </h3>
      <p className="mt-6 max-w-[46ch] text-base leading-7 text-ink-soft">{body}</p>
      <div className="mt-10 md:mt-auto md:pt-10">
        <ActionButton
          to={ctaTo}
          text={ctaText}
          backgroundColor="transparent"
          textColor="#0a0a0a"
          strokeColor="#0a0a0a"
        />
      </div>
    </div>
  );
}

/* ============================================================ */
/* EmptyEditorialState — намеренный, не сирый, empty state.     */
/* ============================================================ */
function EmptyEditorialState({ label, body }: { label: string; body: string }) {
  return (
    <div className="grid gap-8 border-t border-ink py-12 md:grid-cols-12 md:py-16">
      <span className="md:col-span-4 lg:col-span-3 inline-flex items-baseline gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink">
        <span className="text-ink-soft">— —</span>
        {label}
      </span>
      <p className="md:col-span-8 lg:col-span-7 max-w-[58ch] text-base leading-7 text-ink-soft">
        {body}
      </p>
    </div>
  );
}

/* ============================================================ */
/* TicketStamp — чёрный плотный слэб с белым компресс-заголовком*/
/* как у билета на референсе. Заменяет фото-постер.             */
/* ============================================================ */
function TicketStamp({ title }: { title: string }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-ink p-6 text-paper">
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-paper/50">
        — — Дом Союзов
      </span>
      <h4 className="font-heading text-[clamp(28px,3.4vw,46px)] font-black uppercase leading-[0.95] tracking-[0.01em]">
        {title}
      </h4>
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-paper/50">
        Афиша / постер
      </span>
    </div>
  );
}

/* DD.MM из created_at новости. */
function formatNewsDate(article: NewsArticle, lang: 'ru' | 'en'): string {
  if (!article.created_at) return '—';
  const d = new Date(article.created_at);
  if (Number.isNaN(d.getTime())) return '—';
  const months =
    lang === 'ru'
      ? ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЯ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
      : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dd = d.getDate();
  const mmm = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd} ${mmm} ${yy}`;
}
