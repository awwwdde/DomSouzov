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
import { eventCategoryIcon } from '../lib/eventCategory';
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
  const homeEvents = useMemo(() => pickHomeEvents(sortedEvents, 3), [sortedEvents]);
  const homeNews = useMemo(() => pickHomeNews(news, 4), [news]);

  const marqueeItems = list<RawItem>('home_marquee', DEFAULT_MARQUEE)
    .map((m) => pickItem(m, 'text'))
    .filter(Boolean);

  const promos = list<RawItem>('home_promos', []);

  const thesis = t('home_thesis') || (lang === 'ru'
    ? 'Дом Союзов — историческая концертная и церемониальная площадка в центре Москвы. Колонный зал работает с 1784 года: классические концерты, публичные дискуссии, торжественные церемонии и съёмки.'
    : 'House of Unions is a historic concert and ceremonial venue in the heart of Moscow. The Hall of Columns has operated since 1784: classical concerts, public discussions, ceremonies, and filming.');
  const organizersBody = t('home_organizers_body') || (lang === 'ru'
    ? 'Колонный, Октябрьский и Малый залы доступны для концертов, церемоний, форумов и съёмок. Сопровождение и техническое обеспечение.'
    : 'The Hall of Columns and the October and Small halls are available for concerts, ceremonies, forums and filming. Full production support.');
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
        keywords={['концертный зал Москва', 'афиша', 'концерты', 'церемонии', '1784']}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'PerformingArtsTheater',
            name: SITE_NAME,
            alternateName: 'House of Unions',
            url: SITE_URL,
            image: `${SITE_URL}/og-default.jpg`,
            logo: `${SITE_URL}/logo-house.svg`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Большая Дмитровка, 1',
              addressLocality: 'Москва',
              postalCode: '125009',
              addressCountry: 'RU',
            },
            geo: { '@type': 'GeoCoordinates', latitude: '55.7596', longitude: '37.6156' },
            hasMap: 'https://yandex.ru/maps/?text=55.7596,37.6156',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            alternateName: 'House of Unions',
            url: SITE_URL,
            inLanguage: lang === 'ru' ? 'ru-RU' : 'en-US',
            publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          },
        ]}
      />
      {/* ============================================================ */}
      {/* 1. HERO — full-bleed медиа (или типографический fallback)     */}
      {/* ============================================================ */}
      <Section as="div" tone="paper" spacing="none" bleed>
        <div className="relative w-full overflow-hidden bg-ink">
          {heroVideo ? (
            <video
              className="block aspect-[16/9] max-h-[92vh] w-full bg-ink object-cover"
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
              className="block aspect-[16/9] max-h-[92vh] w-full object-cover"
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
              backgroundColor="#1f5f4e"
              textColor="#f7f3e8"
              strokeColor="#1f5f4e"
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
        variant="accent"
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
      {/* ПАРНЫЕ БЛОКИ — Организаторам / Зрителям                       */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="md" bordered>
        {/* Контент выровнен по краям секции (как афиша/новости): боковые отступы
            убраны, разделитель — по центру (divide-x). */}
        <div className="grid gap-12 md:grid-cols-2 md:gap-0 md:divide-x md:divide-line">
          <div className="md:pr-10 lg:pr-14">
            <InfoBlock
              index="01"
              kicker={lang === 'ru' ? 'Залы' : 'Halls'}
              title={lang === 'ru' ? 'Организаторам' : 'For organizers'}
              body={organizersBody}
              ctaText={lang === 'ru' ? 'Залы и условия' : 'Halls & terms'}
              ctaTo="/organizers"
            />
          </div>
          <div className="md:pl-10 lg:pl-14">
            <InfoBlock
              index="02"
              kicker={lang === 'ru' ? 'Посещение' : 'Visit'}
              title={lang === 'ru' ? 'Зрителям' : 'For visitors'}
              body={visitorsBody}
              ctaText={lang === 'ru' ? 'Афиша и билеты' : 'Programme & tickets'}
              ctaTo="/audience"
            />
          </div>
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
            label={lang === 'ru' ? 'Архив мероприятий' : 'Events archive'}
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
      {/* ПРОМО-БАННЕРЫ (из CMS)                                        */}
      {/* ============================================================ */}
      {promos.length > 0 ? (
        <Section tone="paper" spacing="md" bordered>
          <RevealList className={`grid gap-6 ${promos.length === 1 ? '' : promos.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {promos.map((p, i) => (
              <RevealItem key={`promo-${i}`} y={16}>
                <PromoBanner
                  image={pickItem(p, 'image')}
                  title={pickItem(p, 'title')}
                  text={pickItem(p, 'text')}
                  cta={pickItem(p, 'cta')}
                  link={pickItem(p, 'link')}
                  full={promos.length === 1}
                />
              </RevealItem>
            ))}
          </RevealList>
        </Section>
      ) : null}

      {/* ============================================================ */}
      {/* ПАРТНЁРЫ                                                      */}
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
        const Icon = eventCategoryIcon(ev.tag.ru || ev.tag.en);
        const buyHref = ev.has_ticket && ev.ticket_url ? ev.ticket_url : null;

        return (
          <RevealItem key={`event-${ev.id}`} y={16}>
            <motion.div
              className="group flex h-full flex-col"
              variants={{ rest: {}, hover: {} }}
              initial="rest"
              whileHover="hover"
            >
              <Link to={href} className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
                  <Icon size={14} strokeWidth={1.7} className="text-accent" />
                  {tag}
                </span>
                <span className="font-mono text-[clamp(18px,1.5vw,24px)] font-medium leading-none tabular-nums text-ink">
                  {date}
                </span>
              </Link>
              <Link to={href}>
                <h3 className="mt-5 mb-6 font-heading text-[clamp(18px,1.35vw,22px)] font-black uppercase leading-[1.05] tracking-[0.01em] text-ink transition group-hover:text-accent">
                  {title}
                </h3>
              </Link>
              <Link to={href} className="relative aspect-[4/5] w-full overflow-hidden bg-paper-soft">
                {ev.age_rating ? (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold tabular-nums text-paper backdrop-blur-sm">
                    {ev.age_rating}
                  </span>
                ) : null}
                {/* На главной используем ТОЛЬКО вертикальное фото. Нет вертикального
                    — показываем «билет» с названием мероприятия (а не горизонтальное). */}
                {ev.image_vertical ? (
                  <motion.img
                    src={ev.image_vertical}
                    alt={title}
                    loading="lazy"
                    decoding="async"
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
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  to={href}
                  className="inline-flex min-h-9 items-center rounded-full border border-ink px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-paper"
                >
                  {lang === 'ru' ? 'Подробнее' : 'Details'}
                </Link>
                {buyHref ? (
                  <a
                    href={buyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center rounded-full bg-accent px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-paper transition hover:bg-accent-deep"
                  >
                    {lang === 'ru' ? 'Купить билет' : 'Buy tickets'}
                  </a>
                ) : null}
              </div>
            </motion.div>
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
                    loading="lazy"
                    decoding="async"
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
    <div className="flex h-full flex-col bg-paper">
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
/* PromoBanner — рекламный блок из CMS (фон + заголовок + CTA). */
/* ============================================================ */
function PromoBanner({
  image,
  title,
  text,
  cta,
  link,
  full,
}: {
  image: string;
  title: string;
  text: string;
  cta: string;
  link: string;
  full: boolean;
}) {
  const inner = (
    <div className={`group relative flex ${full ? 'min-h-[380px] md:min-h-[420px]' : 'min-h-[320px]'} flex-col justify-end overflow-hidden bg-ink`}>
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-90"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" aria-hidden />
      <div className="relative p-7 md:p-9">
        {title ? (
          <h3 className="font-heading text-[clamp(24px,2.6vw,40px)] font-bold uppercase leading-[1] tracking-[0.02em] text-paper">
            {title}
          </h3>
        ) : null}
        {text ? <p className="mt-3 max-w-md text-sm leading-6 text-paper/80">{text}</p> : null}
        {cta ? (
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper transition group-hover:bg-accent-deep">
            {cta} →
          </span>
        ) : null}
      </div>
    </div>
  );
  if (!link) return inner;
  if (link.startsWith('/')) return <Link to={link} className="block">{inner}</Link>;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
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
