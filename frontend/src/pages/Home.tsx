import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ActionButton from '../components/ActionButton';
import Marquee from '../components/Marquee';
import NavTrio from '../components/NavTrio';
import PartnersSection from '../components/PartnersSection';
import { Container, Section, SectionHead } from '../components/Section';
import { RevealItem, RevealList } from '../components/Reveal';
import { DURATION, transitionBase, useReducedMotionActive } from '../lib/motion';
import { formatDayMonthFromEvent, sortEventsByDate } from '../lib/eventDates';
import { pickHomeEvents, pickHomeNews } from '../lib/homePick';
import { useSite } from '../context/SiteContext';
import type { Event, NewsArticle } from '../types';

const MotionLink = motion(Link);

/* ============================================================ */
/* HOME — главная страница Дома Союзов.                          */
/* Hero сделан по референсу «Колесо»: кикер слева мелкий,        */
/* H1 справа гигантский в одну строку. Кнопка «Смотреть афишу»   */
/* поверх H1 (правый верх). Видео — отдельным блоком ниже.       */
/* Карточки событий и новостей — единый формат «Искусство Кино»  */
/* 3 в ряд, с тегом и датой DD.MM под фото.                      */
/* ============================================================ */

export default function Home() {
  const { lang, content, t } = useSite();
  const reduced = useReducedMotionActive();
  const events = content?.events ?? [];
  const news = content?.news ?? [];
  const partners = content?.partners ?? [];

  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');
  /* CTA-фон — ТОЛЬКО из настройки. Не подсовывать gallery[0]. */
  const ctaBg = t('cta_background_url');

  const sortedEvents = useMemo(() => sortEventsByDate(events, lang), [events, lang]);
  const homeEvents = useMemo(() => pickHomeEvents(sortedEvents, 6), [sortedEvents]);
  const homeNews = useMemo(() => pickHomeNews(news, 6), [news]);

  const marqueeItems =
    lang === 'ru'
      ? ['Колонный зал', 'С 1784 года', 'Большая Дмитровка 1', 'Культурная площадка Москвы']
      : ['Hall of Columns', 'Since 1784', 'Bolshaya Dmitrovka 1', 'A cultural stage of Moscow'];

  const kickerLines =
    lang === 'ru' ? ['Культура', 'Архитектура', 'События'] : ['Culture', 'Architecture', 'Events'];

  const heroTitle = lang === 'ru' ? 'Дом Союзов' : 'House of Unions';

  const thesis =
    lang === 'ru'
      ? 'Тишина зала — точка отсчёта для музыки и слова.'
      : 'The silence of the hall — the starting point for music and word.';

  const aboutLead =
    lang === 'ru'
      ? 'Москва · с 1784 года. Дом Союзов — Колонный зал, церемонии и публичные дискуссии на Большой Дмитровке.'
      : 'Moscow · since 1784. The House of Unions — the Hall of Columns, ceremonies, and public life on Bolshaya Dmitrovka.';

  const navTrio: [
    { to: string; title: string },
    { to: string; title: string },
    { to: string; title: string },
  ] = [
    { to: '/halls', title: lang === 'ru' ? 'Залы' : 'Halls' },
    { to: '/events', title: lang === 'ru' ? 'Афиша' : 'Programme' },
    { to: '/news', title: lang === 'ru' ? 'Новости' : 'News' },
  ];

  return (
    <div className="w-full bg-paper">
      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <Section as="div" tone="paper" spacing="none">
        <Container className="pt-20 md:pt-24 lg:pt-28">
          {/*
            HERO по референсу «Колесо»:
              ┌─────────────┬─────────────────────────────┐
              │  КУЛЬТУРА   │                             │
              │ АРХИТЕКТУРА │   Д О М   С О Ю З О В       │
              │  СОБЫТИЯ    │                             │
              └─────────────┴─────────────────────────────┘
              ┌──────────────────────────────┬──────────┐
              │                              │ СМОТРЕТЬ │  ← кнопка
              │      [   ВИДЕО 16:9   ]      │  АФИШУ   │     внутри видео,
              │                              └──────────┘     правый-верх
              └─────────────────────────────────────────┘
            Кикер слева prижат к левому краю, H1 справа занимает
            всю оставшуюся ширину, упирается в правый край.
            На мобайле та же логика, не переносится в столбик.
          */}
          <div className="flex items-center gap-4 md:gap-8 lg:gap-12">
            {/* Кикер слева — мелкий, столбиком, выровнен по левому краю */}
            <div className="flex shrink-0 flex-col gap-1 self-center">
              {kickerLines.map((line) => (
                <span
                  key={line}
                  className="block text-[9px] font-bold uppercase tracking-[0.2em] text-muted md:text-[11px] md:tracking-[0.24em]"
                >
                  {line}
                </span>
              ))}
            </div>

            {/* H1 — без RevealMask. На первом экране простой fade,
               чтобы не остаться скрытым clip-path-маской при загрузке. */}
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0 : DURATION.slow,
                ease: transitionBase.ease,
              }}
              className="min-w-0 flex-1 whitespace-nowrap text-right font-heading text-[clamp(48px,16vw,220px)] font-bold uppercase leading-[0.86] tracking-[-0.01em] text-ink"
            >
              {heroTitle}
            </motion.h1>
          </div>

          {/* Блок видео + кнопка ВНУТРИ видео (правый верх). */}
          <div className="relative mt-8 w-full overflow-hidden border border-line bg-ink/[0.04] md:mt-12 aspect-video">
            {heroVideo ? (
              <video
                className="h-full w-full object-cover"
                src={heroVideo}
                poster={heroPoster || undefined}
                preload="metadata"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : heroPoster ? (
              <img src={heroPoster} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink/15 to-ink/5">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
                  {lang === 'ru' ? 'Видео обложки' : 'Cover video'}
                </span>
              </div>
            )}

            {/* Кнопка «Смотреть афишу» — на верхней правой части видео */}
            <div className="absolute right-5 top-5 z-10 md:right-8 md:top-8">
              <ActionButton
                to="/events"
                text={lang === 'ru' ? 'Смотреть афишу' : 'View programme'}
                backgroundColor="#2f5d50"
                textColor="#f7f7f2"
                strokeColor="#2f5d50"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* ============================================================ */}
      {/* ABOUT-INTRO                                                   */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="md" bordered>
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <p className="font-heading text-[clamp(26px,3vw,46px)] font-bold uppercase leading-[1.1] tracking-[0.02em] text-ink">
            {thesis}
          </p>
          <p className="self-end text-sm leading-7 text-ink-soft md:text-base">{aboutLead}</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <ActionButton
            to="/about"
            text={lang === 'ru' ? 'Больше о нас' : 'More about us'}
            backgroundColor="#2f5d50"
            textColor="#f7f7f2"
            strokeColor="#2f5d50"
          />
          <ActionButton
            to="/organizers"
            text={lang === 'ru' ? 'Организаторам' : 'For organizers'}
            backgroundColor="transparent"
            textColor="#171717"
            strokeColor="#171717"
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/* MARQUEE                                                       */}
      {/* ============================================================ */}
      <Marquee
        items={marqueeItems}
        variant="dark"
        duration={26}
        aria-label={lang === 'ru' ? 'Анонс' : 'Highlights'}
      />

      {/* ============================================================ */}
      {/* СОБЫТИЯ — карточки 3 в ряд «Искусство Кино»                   */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="md" bordered>
        <SectionHead
          kicker={lang === 'ru' ? 'Афиша' : 'Programme'}
          title={lang === 'ru' ? 'Ближайшие события' : 'Upcoming events'}
          action={
            <ActionButton
              to="/events"
              text={lang === 'ru' ? 'Вся афиша' : 'Full programme'}
              backgroundColor="transparent"
              textColor="#171717"
              strokeColor="#171717"
            />
          }
        />

        {homeEvents.length === 0 ? (
          <p className="text-sm text-ink-soft">
            {lang === 'ru'
              ? 'События появятся после публикации в CMS.'
              : 'Events will appear after they are published in the CMS.'}
          </p>
        ) : (
          <CardGrid
            items={homeEvents}
            type="event"
            lang={lang}
            reduced={reduced}
          />
        )}
      </Section>

      {/* ============================================================ */}
      {/* CTA-BANNER                                                    */}
      {/* ============================================================ */}
      <section className="relative min-h-[min(52vh,560px)] overflow-hidden border-y border-line bg-ink">
        {ctaBg ? (
          <img src={ctaBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        ) : null}
        <div className="absolute inset-0 bg-ink/85" aria-hidden />
        <Container className="relative flex min-h-[min(52vh,560px)] flex-col items-center justify-center py-20 text-center">
          <h2 className="max-w-4xl font-heading text-[clamp(40px,6vw,96px)] font-bold uppercase leading-[0.94] tracking-[0.03em] text-paper">
            {lang === 'ru' ? 'Выберите своё мероприятие' : 'Choose your event'}
          </h2>
          <div className="mt-10">
            <ActionButton
              to="/events"
              text={lang === 'ru' ? 'Смотреть афишу' : 'View programme'}
              backgroundColor="#2f5d50"
              textColor="#f7f7f2"
              strokeColor="#2f5d50"
            />
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* НОВОСТИ — карточки 3 в ряд «Искусство Кино»                   */}
      {/* ============================================================ */}
      <Section tone="paper" spacing="md" bordered>
        <SectionHead
          kicker={lang === 'ru' ? 'Новости' : 'News'}
          title={lang === 'ru' ? 'Хроника' : 'Chronicle'}
          action={
            <ActionButton
              to="/news"
              text={lang === 'ru' ? 'Все материалы' : 'All stories'}
              backgroundColor="transparent"
              textColor="#171717"
              strokeColor="#171717"
            />
          }
        />

        {homeNews.length === 0 ? (
          <p className="text-sm text-ink-soft">
            {lang === 'ru' ? 'Материалы появятся в CMS.' : 'Stories will appear in the CMS.'}
          </p>
        ) : (
          <CardGrid
            items={homeNews}
            type="news"
            lang={lang}
            reduced={reduced}
          />
        )}
      </Section>

      {/* ============================================================ */}
      {/* NAV-TRIO                                                      */}
      {/* ============================================================ */}
      <NavTrio items={navTrio} />

      {/* ============================================================ */}
      {/* ПАРТНЁРЫ                                                      */}
      {/* ============================================================ */}
      <PartnersSection partners={partners} lang={lang} />
    </div>
  );
}

/* ============================================================ */
/* CARD GRID — единая сетка карточек для событий и новостей.    */
/* Формат «Искусство Кино»: фото → линия → тег слева + DD.MM    */
/* справа → заголовок капсом → опционально описание.            */
/* 3 кол на десктопе, 2 на планшете, 1 на мобайле.              */
/* ============================================================ */

type CardGridProps =
  | { items: Event[]; type: 'event'; lang: 'ru' | 'en'; reduced: boolean }
  | { items: NewsArticle[]; type: 'news'; lang: 'ru' | 'en'; reduced: boolean };

function CardGrid(props: CardGridProps) {
  const { items, type, lang, reduced } = props;
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <RevealList className="grid border-t border-line md:grid-cols-2 md:gap-x-8 lg:grid-cols-3 lg:gap-x-10">
      {items.map((item, i) => {
        const isEvent = type === 'event';
        const ev = isEvent ? (item as Event) : null;
        const nw = isEvent ? null : (item as NewsArticle);

        const href = isEvent ? `/events/${ev!.id}` : `/news/${nw!.id}`;
        const image = isEvent ? ev!.image : nw!.image;
        const title = isEvent ? l(ev!.title) : l(nw!.title);
        const tag = isEvent ? l(ev!.tag) : l(nw!.tag);
        const meta = isEvent
          ? formatDayMonthFromEvent(ev!, lang)
          : formatNewsDate(nw!, lang);

        return (
          <RevealItem
            key={`${type}-${item.id}`}
            y={16}
            className="border-b border-line pb-10 pt-5 md:pt-6"
          >
            <MotionLink
              to={href}
              className="group flex h-full flex-col"
              variants={{ rest: {}, hover: {} }}
              initial="rest"
              whileHover="hover"
            >
              {/*
                Порядок как у «Искусства Кино»:
                1) заголовок наверху,
                2) тег + дата,
                3) большое фото.
              */}
              <h3 className="mb-5 font-heading text-[clamp(15px,1.15vw,18px)] font-bold uppercase leading-[1.2] tracking-[0.03em] text-ink transition group-hover:text-accent">
                {title}
              </h3>

              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  <span className="size-2 rounded-full bg-ink" aria-hidden />
                  {tag}
                </span>
                <span className="font-heading text-[clamp(22px,2.1vw,30px)] font-bold leading-none tabular-nums text-ink">
                  {meta}
                </span>
              </div>

              <div className="relative aspect-[4/5] overflow-hidden bg-ink/[0.05]">
                {image ? (
                  <motion.img
                    src={image}
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
                  <div className="flex h-full items-center justify-center p-6 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    {tag}
                  </div>
                )}
              </div>
            </MotionLink>
          </RevealItem>
        );
      })}
    </RevealList>
  );
}

/* DD.MM из created_at новости. Если поля нет — пробуем взять из excerpt/title — пропускаем. */
function formatNewsDate(article: NewsArticle, _lang: 'ru' | 'en'): string {
  if (!article.created_at) return '—';
  const d = new Date(article.created_at);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}