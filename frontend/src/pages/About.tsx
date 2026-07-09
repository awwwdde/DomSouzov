import { useMemo, useState, useId, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import { useReducedMotionActive } from '../lib/motion';
import { Section } from '../components/Section';
import ActionButton from '../components/ActionButton';
import HeroVideo from '../components/HeroVideo';
import Seo from '../components/Seo';
import type { AboutHoverTip, AboutScatteredPhoto, AboutTimelineEvent } from '../types';

/* ================================================================ */
/* ABOUT — страница «О Доме Союзов».                                 */
/*                                                                  */
/* Стадии:                                                          */
/*  1. Hero — full-bleed видео/фото (как на главной).               */
/*  2. Intro — текст с акцентными фразами, на hover которых         */
/*     всплывает фото/видео/гиф (управляется через админку).        */
/*  3. Scattered photos — фотографии «вразброс» с разными           */
/*     скоростями и моментами появления.                            */
/*  4. Facts — крупные цифры на тёмном.                             */
/*  5. Timeline — зигзаг-хронология с плавным появлением.           */
/*  6. CTA — кнопки «Организаторам» и «Мероприятия».                */
/*                                                                  */
/* Плавный скролл уже обеспечивает SmoothScrollProvider (Lenis).    */
/* ================================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function About() {
  const { lang, t, content } = useSite();
  const reduced = useReducedMotionActive();

  const heroVideo = t('about_hero_video_url') || t('hero_video_url');
  const heroPoster = t('about_hero_video_poster') || t('hero_video_poster');
  const heroKicker = t('about_hero_kicker') || (lang === 'ru' ? 'Большая Дмитровка · с 1784' : 'Bolshaya Dmitrovka · since 1784');
  const heroTitle = t('about_hero_title') || (lang === 'ru' ? 'О Доме Союзов' : 'About the House');
  const introFallback =
    lang === 'ru'
      ? 'Дом Союзов — один из старейших и самых известных залов Москвы. За белой колоннадой Колонного зала почти два с половиной века звучат музыка, голоса и аплодисменты.\n\nЗдесь выступали Чайковский, Лист и Рахманинов, проходили торжественные собрания и премьеры, которые становились частью истории страны.\n\nСегодня Дом Союзов соединяет наследие и современность: концерты, литературные вечера, церемонии и встречи в интерьерах, сохранивших дух эпохи.'
      : 'The House of Unions is one of the oldest and most celebrated halls in Moscow. Behind the white colonnade of the Hall of Columns, music, voices and applause have resounded for almost two and a half centuries.\n\nTchaikovsky, Liszt and Rachmaninoff performed here; here too were held the ceremonies and premieres that became part of the nation’s history.\n\nToday the House of Unions unites heritage and the present day: concerts, literary evenings, ceremonies and gatherings within interiors that have preserved the spirit of the age.';
  const introText = t('about_intro_text') || introFallback;

  const about = content?.about ?? { hover_tips: [], scattered_photos: [], timeline: [] };

  const aboutDesc =
    (introText && introText.replace(/\s+/g, ' ').trim().slice(0, 200)) ||
    (lang === 'ru'
      ? 'История, архитектура и сегодняшний день Дома Союзов и Колонного зала в центре Москвы.'
      : 'History, architecture and the present day of the House of Unions and its Hall of Columns in Moscow.');

  return (
    <div className="w-full overflow-x-hidden bg-paper text-ink">
      <Seo
        title={lang === 'ru' ? 'О Доме — Дом Союзов' : 'About — House of Unions'}
        description={aboutDesc}
        path="about"
        lang={lang}
      />
      <HeroStage video={heroVideo} poster={heroPoster} kicker={heroKicker} title={heroTitle} reduced={reduced} />
      <NarrativeStage
        text={introText}
        tips={about.hover_tips}
        photos={about.scattered_photos}
        kicker={lang === 'ru' ? 'О Доме' : 'About'}
        lang={lang}
        reduced={reduced}
      />
      <FactsStage lang={lang} reduced={reduced} t={t} />
      <TimelineStage
        items={about.timeline}
        kicker={t('about_timeline_kicker') || (lang === 'ru' ? 'Хронология' : 'Timeline')}
        heading={t('about_timeline_heading') || (lang === 'ru' ? 'Годы Дома Союзов' : 'Years of the House')}
        lang={lang}
        reduced={reduced}
      />
      <CTAStage lang={lang} reduced={reduced} />
    </div>
  );
}

/* ================================================================ */
/* 1. HERO — full-bleed как на главной.                              */
/* ================================================================ */
function HeroStage({
  video,
  poster,
  kicker,
  title,
  reduced,
}: {
  video: string;
  poster: string;
  kicker: string;
  title: string;
  reduced: boolean;
}) {
  return (
    <Section as="div" tone="paper" spacing="none" bleed>
      <div className="relative w-full overflow-hidden bg-ink">
        {video ? (
          <HeroVideo
            src={video}
            poster={poster}
            className="block h-[86vh] max-h-[900px] min-h-[480px] w-full bg-ink object-cover"
          />
        ) : poster ? (
          <img
            src={poster}
            alt=""
            className="block h-[86vh] max-h-[900px] min-h-[480px] w-full object-cover"
          />
        ) : (
          <div className="relative flex h-[78vh] max-h-[860px] min-h-[520px] w-full items-end justify-start overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(1200px 700px at 78% 18%, rgba(47,93,80,0.55), transparent 60%), radial-gradient(900px 500px at 12% 92%, rgba(247,247,242,0.10), transparent 55%), #141413',
              }}
              aria-hidden
            />
          </div>
        )}

        {/* Overlay c заголовком */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-5 pb-10 md:w-[95%] md:px-6 md:pb-16">
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="font-heading text-[clamp(56px,10vw,180px)] font-bold uppercase leading-[0.86] tracking-[0.01em] text-paper"
            >
              {title}
            </motion.h1>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ================================================================ */
/* 2. NARRATIVE — чередование текста и фото: текст → фото → текст…    */
/*                                                                  */
/* Абзацы введения и фотографии (обе сущности — из бэкенда)         */
/* складываются в ленту в духе старого сайта: пара «текст + снимок»  */
/* уходит то влево, то вправо (зигзаг). Снимок — целиком, в рамке-   */
/* паспарту, с курсивной подписью.                                   */
/* ================================================================ */
type NarrativeBlock =
  | { kind: 'text'; parts: TextPart[]; first: boolean; side: 'left' | 'right' }
  | { kind: 'photo'; photo: AboutScatteredPhoto; side: 'left' | 'right' };

function NarrativeStage({
  text,
  tips,
  photos,
  kicker,
  lang,
  reduced,
}: {
  text: string;
  tips: AboutHoverTip[];
  photos: AboutScatteredPhoto[];
  kicker: string;
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  /* Текст → абзацы → части с hover-фразами.
     Абзац = любая строка (Enter). Пустые строки игнорируем, поэтому работает
     и при одинарных, и при двойных переносах — «как пользователь разметил». */
  const paragraphs = useMemo(
    () =>
      text
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => parseTextWithTips(p, tips, lang)),
    [text, tips, lang]
  );

  /* Каждый абзац → сразу за ним снимок (фото идут по кругу, если их меньше,
     чем абзацев — чтобы фото было ПОСЛЕ КАЖДОГО абзаца, сколько бы текста ни
     было). Если снимков больше, чем абзацев — лишние показываем в конце.
     Пара «абзац + фото» уходит то влево, то вправо (зигзаг). */
  const blocks = useMemo<NarrativeBlock[]>(() => {
    const out: NarrativeBlock[] = [];
    const pc = photos.length;
    paragraphs.forEach((parts, i) => {
      const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
      out.push({ kind: 'text', parts, first: i === 0, side });
      if (pc > 0) out.push({ kind: 'photo', photo: photos[i % pc], side });
    });
    // Снимков больше, чем абзацев (или текста вовсе нет) — добавим оставшиеся.
    for (let j = paragraphs.length; j < pc; j += 1) {
      out.push({ kind: 'photo', photo: photos[j], side: j % 2 === 0 ? 'left' : 'right' });
    }
    return out;
  }, [paragraphs, photos]);

  return (
    <Section tone="paper" spacing="md" bordered>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mb-10 md:mb-14"
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft">
          {kicker}
        </span>
      </motion.div>

      <div className="mx-auto flex max-w-[1180px] flex-col gap-y-16 md:gap-y-28">
        {blocks.map((b, i) =>
          b.kind === 'text' ? (
            <NarrativeText key={`t-${i}`} parts={b.parts} first={b.first} side={b.side} lang={lang} reduced={reduced} />
          ) : (
            <NarrativePhoto key={`p-${i}`} photo={b.photo} side={b.side} reduced={reduced} />
          )
        )}
      </div>
    </Section>
  );
}

/** Текстовый блок ленты: читаемая мера, уходит влево/вправо «зигзагом». */
function NarrativeText({
  parts,
  first,
  side,
  lang,
  reduced,
}: {
  parts: TextPart[];
  first: boolean;
  side: 'left' | 'right';
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: side === 'right' ? 24 : -24, y: 12 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={['w-full md:w-[60%]', side === 'right' ? 'md:ml-auto' : 'md:mr-auto'].join(' ')}
    >
      <p
        lang={lang}
        className={[
          'text-ink text-lg leading-8 md:text-[22px] md:leading-[1.62]',
          // Выключка по ширине на всех экранах; без переноса слов, последняя
          // строка выравнивается влево.
          'text-justify [hyphens:none] [text-align-last:start]',
          first
            ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-heading first-letter:text-[64px] first-letter:font-bold first-letter:leading-[0.7] first-letter:text-accent'
            : '',
        ].join(' ')}
      >
        {parts.map((part, i) =>
          part.type === 'text' ? (
            <span key={i}>{part.value}</span>
          ) : (
            <HoverPhrase key={i} tip={part.tip} lang={lang} reduced={reduced}>
              {part.value}
            </HoverPhrase>
          )
        )}
      </p>
    </motion.div>
  );
}

/** Фото-блок ленты: снимок целиком (без обрезки) в рамке-паспарту,        */
/* уходит влево/вправо «зигзагом», без подписи.                            */
function NarrativePhoto({
  photo,
  side,
  reduced,
}: {
  photo: AboutScatteredPhoto;
  side: 'left' | 'right';
  reduced: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: side === 'right' ? 36 : -36, y: 24 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: EASE }}
      className={[
        'flex w-full md:w-[60%]',
        side === 'right' ? 'md:ml-auto md:justify-end' : 'md:mr-auto md:justify-start',
      ].join(' ')}
    >
      {photo.image ? (
        <img
          src={photo.image}
          alt=""
          loading="lazy"
          className="block max-h-[80vh] w-auto max-w-full"
        />
      ) : (
        <div className="aspect-[3/4] w-full max-w-[460px] overflow-hidden bg-ink">
          <PhotoFallback />
        </div>
      )}
    </motion.div>
  );
}

type TextPart =
  | { type: 'text'; value: string }
  | { type: 'phrase'; value: string; tip: AboutHoverTip };

/** Делит текст на куски, оборачивая первое вхождение каждой фразы в `phrase`-часть. */
function parseTextWithTips(text: string, tips: AboutHoverTip[], lang: 'ru' | 'en'): TextPart[] {
  if (!text) return [];
  if (!tips.length) return [{ type: 'text', value: text }];

  /* Сортируем по длине (длинные сначала), чтобы «Чайковский, Лист» не съел «Лист». */
  const active = tips
    .map((t) => ({ tip: t, phrase: (t.phrase[lang] || t.phrase.ru || '').trim() }))
    .filter((x) => x.phrase.length > 0)
    .sort((a, b) => b.phrase.length - a.phrase.length);

  /* Алгоритм: идём по тексту слева направо, ищем ближайшее вхождение любой ещё */
  /* не использованной фразы. Когда нашли — пушим pre-text, phrase, и сдвигаем cursor. */
  const used = new Set<number>();
  const out: TextPart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let bestIdx = -1;
    let bestPos = Infinity;
    for (let i = 0; i < active.length; i++) {
      if (used.has(i)) continue;
      const pos = text.indexOf(active[i].phrase, cursor);
      if (pos !== -1 && pos < bestPos) {
        bestPos = pos;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) {
      out.push({ type: 'text', value: text.slice(cursor) });
      break;
    }

    if (bestPos > cursor) {
      out.push({ type: 'text', value: text.slice(cursor, bestPos) });
    }
    const { tip, phrase } = active[bestIdx];
    out.push({ type: 'phrase', value: phrase, tip });
    used.add(bestIdx);
    cursor = bestPos + phrase.length;
  }

  return out;
}

/** Inline-span с подчёркиванием и hover-popover с медиа из админки. */
function HoverPhrase({
  tip,
  lang,
  reduced,
  children,
}: {
  tip: AboutHoverTip;
  lang: 'ru' | 'en';
  reduced: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const hasMedia = Boolean(tip.media_url);
  const caption = tip.caption[lang] || tip.caption.ru;

  return (
    <span
      className="group relative inline-block cursor-help align-baseline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-describedby={open ? id : undefined}
    >
      <span className="relative whitespace-nowrap font-semibold text-ink">
        {children}
        <span
          aria-hidden
          className="absolute -bottom-0.5 left-0 block h-px w-full bg-ink/40 transition-[background] group-hover:bg-ink"
        />
      </span>

      <AnimatePresence>
        {open && hasMedia && (
          <motion.span
            id={id}
            role="tooltip"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="pointer-events-none absolute left-1/2 top-full z-40 mt-3 inline-block w-[260px] -translate-x-1/2 sm:w-[320px]"
          >
            <span className="relative block overflow-hidden rounded-md bg-ink text-paper shadow-[0_24px_60px_-24px_rgba(20,20,19,0.45)]">
              <span className="block aspect-[4/3] w-full bg-ink-soft">
                {tip.media_type === 'video' ? (
                  <video
                    src={tip.media_url}
                    className="block h-full w-full bg-ink object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={tip.media_url}
                    alt={caption || (typeof children === 'string' ? children : '')}
                    className="block h-full w-full object-cover"
                  />
                )}
              </span>
              {caption ? (
                <span className="block px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-paper/80">
                  {caption}
                </span>
              ) : null}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function PhotoFallback() {
  return (
    <div
      className="h-full w-full"
      aria-hidden
      style={{
        background:
          'radial-gradient(600px 360px at 50% 110%, rgba(47,93,80,0.35), transparent 60%), linear-gradient(180deg, #1a1a18 0%, #0f0f0e 100%)',
      }}
    />
  );
}

/* ================================================================ */
/* 4. FACTS — крупные цифры в тёмном блоке, плавное появление.      */
/* ================================================================ */
function FactsStage({ lang, reduced, t }: { lang: 'ru' | 'en'; reduced: boolean; t: (k: string) => string }) {
  /* Берём fact1..fact4 из site_settings; если 4-го нет — дополняем дефолтом. */
  const facts = [1, 2, 3, 4].map((i) => ({
    num: t(`fact${i}_number`) || ['1784', '28', '1 021', 'XIX'][i - 1],
    label: t(`fact${i}_label`) || ['Год постройки', 'Коринфских колонн', 'Мест в Колонном зале', 'Век великих премьер'][i - 1],
  }));

  // Фото здания (вырезанный PNG на прозрачном фоне) — «выпирает» из тёмного блока.
  const rawImage = t('about_facts_image');
  const buildingImage = rawImage
    ? rawImage.startsWith('http') || rawImage.startsWith('/')
      ? rawImage
      : `/${rawImage}`
    : '';

  return (
    <Section tone="ink" spacing="md" bordered className="relative">
      {/* Здание — выпирает вверх за пределы тёмного блока и лежит ПОВЕРХ него
          (z-10). Прижато к низу, бликует вправо. Показываем только на десктопе,
          где справа есть свободное место (цифры уведены влево колонками сетки). */}
      {buildingImage ? (
        <motion.img
          src={buildingImage}
          alt={lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
          loading="lazy"
          decoding="async"
          aria-hidden
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="pointer-events-none absolute -top-24 bottom-0 right-0 z-10 hidden h-[calc(100%+6rem)] w-auto max-w-[42%] select-none object-contain object-bottom xl:block"
        />
      ) : null}

      {/* Контент. При наличии фото цифры и заголовок уводим влево не padding'ом
          (он сжимал заголовок и «АРХИТЕКТУРА» налезала на числа), а колонками:
          на xl заголовок = col-span-6, цифры = col-span-6, правые 12→24 колонки
          остаются свободными под здание. */}
      <div className="relative z-0 grid gap-10 md:grid-cols-12 md:gap-12">
        <div className={buildingImage ? 'md:col-span-5 xl:col-span-4' : 'md:col-span-5'}>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-paper/55">
            {lang === 'ru' ? 'В цифрах' : 'In figures'}
          </span>
          <h2 className="mt-4 font-heading text-[clamp(32px,3.6vw,64px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-paper">
            {lang === 'ru' ? 'Архитектура и масштаб' : 'Architecture and scale'}
          </h2>
        </div>
        <div className={buildingImage ? 'md:col-span-7 xl:col-span-3' : 'md:col-span-7'}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
            {facts.map((f, i) => (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
              >
                <div className="font-heading text-[clamp(40px,4vw,80px)] font-bold uppercase leading-[0.86] tracking-[-0.01em] tabular-nums text-paper">
                  {f.num}
                </div>
                <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em] text-paper/60">
                  {f.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ================================================================ */
/* 5. TIMELINE — зигзаг-хронология, плавное появление.               */
/* ================================================================ */
function TimelineStage({
  items,
  kicker,
  heading,
  lang,
  reduced,
}: {
  items: AboutTimelineEvent[];
  kicker: string;
  heading: string;
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  if (!items.length) return null;
  return (
    <Section tone="paper" spacing="md" bordered>
      <div className="mb-12 grid gap-8 md:mb-16 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-3">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft">
            {kicker}
          </span>
        </div>
        <h2 className="md:col-span-9 font-heading text-[clamp(36px,5vw,80px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
          {heading}
        </h2>
      </div>

      <ul className="relative grid gap-12 md:gap-20">
        {/* Центральная разделительная линия — еле заметная, без точек. */}
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-line md:block" />

        {items.map((it, i) => {
          const isLeft = i % 2 === 0;
          const title = it.title[lang] || it.title.ru;
          const desc = it.description[lang] || it.description.ru;
          const tag = it.tag ? it.tag[lang] || it.tag.ru : '';
          return (
            <motion.li
              key={it.id}
              initial={reduced ? false : { opacity: 0, x: isLeft ? -40 : 40, y: 16 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE }}
              className={[
                'relative grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-16',
                isLeft ? '' : 'md:[&>*:first-child]:order-2',
              ].join(' ')}
            >
              <div className={isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}>
                {tag ? (
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                    {tag}
                  </div>
                ) : null}
                <div className="font-heading text-[clamp(40px,5vw,80px)] font-bold uppercase leading-none tracking-[0.01em] tabular-nums text-ink">
                  {it.year}
                </div>
                <div className="mt-3 font-heading text-[clamp(18px,1.5vw,24px)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-ink">
                  {title}
                </div>
                {desc ? (
                  <p
                    lang={lang}
                    className={['mt-3 w-full text-base leading-7 text-ink-soft text-justify [hyphens:none] [text-align-last:start]', isLeft ? 'md:ml-auto' : ''].join(' ')}
                  >
                    {desc}
                  </p>
                ) : null}
              </div>
              <div className={isLeft ? 'md:pl-8' : 'md:pr-8'}>
                {it.image ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
                    <img src={it.image} alt={title} className="block h-full w-full object-cover" />
                  </div>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Section>
  );
}

/* ================================================================ */
/* 6. CTA — финальные кнопки.                                        */
/* ================================================================ */
function CTAStage({ lang, reduced }: { lang: 'ru' | 'en'; reduced: boolean }) {
  return (
    <Section tone="paper-soft" spacing="md">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between md:gap-12"
      >
        <h2 className="max-w-[20ch] font-heading text-[clamp(32px,4vw,64px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
          {lang === 'ru' ? 'Продолжить знакомство' : 'Continue exploring'}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton
            to="/organizers"
            text={lang === 'ru' ? 'Организаторам' : 'For organizers'}
            backgroundColor="#0a0a0a"
            textColor="#f0ebe0"
            strokeColor="#0a0a0a"
          />
          <ActionButton
            to="/events"
            text={lang === 'ru' ? 'Мероприятия' : 'Events'}
            backgroundColor="transparent"
            textColor="#0a0a0a"
            strokeColor="#0a0a0a"
          />
        </div>
      </motion.div>
    </Section>
  );
}
