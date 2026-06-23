import { useMemo, useRef, useState, useId, type ReactNode } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, type MotionValue } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import { useReducedMotionActive } from '../lib/motion';
import { Section } from '../components/Section';
import ActionButton from '../components/ActionButton';
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
      <IntroStage text={introText} tips={about.hover_tips} lang={lang} reduced={reduced} />
      <ScatteredPhotosStage
        photos={about.scattered_photos}
        kicker={t('about_photos_kicker') || (lang === 'ru' ? 'Архив' : 'Archive')}
        heading={t('about_photos_heading') || (lang === 'ru' ? 'Дом в кадрах' : 'The House in frames')}
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
          <video
            className="block h-[78vh] max-h-[860px] min-h-[520px] w-full object-cover"
            src={video}
            poster={poster || undefined}
            preload="metadata"
            muted
            autoPlay
            loop
            playsInline
          />
        ) : poster ? (
          <img
            src={poster}
            alt=""
            className="block h-[78vh] max-h-[860px] min-h-[520px] w-full object-cover"
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
/* 2. INTRO — текст с акцентными фразами и hover-медиа.              */
/* ================================================================ */
function IntroStage({
  text,
  tips,
  lang,
  reduced,
}: {
  text: string;
  tips: AboutHoverTip[];
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  /* Делим текст на абзацы по пустой строке, каждый разбираем на части
     с hover-фразами по отдельности. */
  const paragraphs = useMemo(
    () =>
      text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => parseTextWithTips(p, tips, lang)),
    [text, tips, lang]
  );

  return (
    <Section tone="paper" spacing="md" bordered>
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="md:col-span-3"
        >
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft">
            {lang === 'ru' ? 'О Доме' : 'About'}
          </span>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
          className="md:col-span-9"
        >
          {paragraphs.map((parts, pi) => (
            <p
              key={pi}
              className={`text-lg leading-9 text-ink md:text-2xl md:leading-[1.5] ${
                pi === 0 ? 'border-t border-ink pt-8' : 'mt-6 md:mt-8'
              }`}
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
          ))}
        </motion.div>
      </div>
    </Section>
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
                    className="block h-full w-full object-cover"
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

/* ================================================================ */
/* 3. SCATTERED PHOTOS — фото с разными скоростями параллакса.       */
/* ================================================================ */
function ScatteredPhotosStage({
  photos,
  kicker,
  heading,
  lang,
  reduced,
}: {
  photos: AboutScatteredPhoto[];
  kicker: string;
  heading: string;
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  /* Расчёт высоты секции: чем больше фото, тем длиннее «полотно». */
  const sectionMinHeight = Math.max(900, photos.length * 280 + 600);

  /* Если фоток нет — рисуем плейсхолдеры, чтобы секция не пустовала. */
  const items = photos.length ? photos : placeholderPhotos();

  return (
    <Section tone="paper-soft" spacing="md" bordered>
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

      <div
        ref={ref}
        className="relative grid grid-cols-12 gap-3 md:gap-4"
        style={{ minHeight: sectionMinHeight }}
      >
        {items.map((p) => (
          <ScatteredPhotoItem
            key={p.id}
            photo={p}
            scrollProgress={scrollYProgress}
            lang={lang}
            reduced={reduced}
          />
        ))}
      </div>
    </Section>
  );
}

function ScatteredPhotoItem({
  photo,
  scrollProgress,
  lang,
  reduced,
}: {
  photo: AboutScatteredPhoto;
  scrollProgress: MotionValue<number>;
  lang: 'ru' | 'en';
  reduced: boolean;
}) {
  /* Параллакс — амплитуда зависит от parallax_speed. */
  const amp = (photo.parallax_speed || 0) * 220;
  const y = useTransform(scrollProgress, [0, 1], reduced ? [0, 0] : [amp, -amp]);

  /* Появление: фото проявляется, когда прогресс секции достигает reveal_progress. */
  const r = clamp01(photo.reveal_progress ?? 0);
  const opacity = useTransform(
    scrollProgress,
    [Math.max(0, r - 0.08), r, Math.min(1, r + 0.4)],
    reduced ? [1, 1, 1] : [0, 1, 1]
  );
  const fadeY = useTransform(
    scrollProgress,
    [Math.max(0, r - 0.08), r],
    reduced ? [0, 0] : [40, 0]
  );

  const colStart = clampInt(photo.col_start || 1, 1, 12);
  const colSpan = clampInt(photo.col_span || 4, 1, 13 - colStart);
  const offsetY = photo.offset_y || 0;
  const caption = photo.caption[lang] || photo.caption.ru;

  return (
    <motion.figure
      className="relative"
      style={{
        gridColumnStart: colStart,
        gridColumnEnd: `span ${colSpan}`,
        marginTop: offsetY,
        y,
        opacity,
      }}
    >
      <motion.div
        style={{ y: fadeY }}
        className="relative w-full overflow-hidden bg-ink"
      >
        <div className="aspect-[4/3] w-full">
          {photo.image ? (
            <img src={photo.image} alt={caption} className="block h-full w-full object-cover" />
          ) : (
            <PhotoFallback />
          )}
        </div>
      </motion.div>
      {caption ? (
        <figcaption className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
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

function placeholderPhotos(): AboutScatteredPhoto[] {
  return [
    { id: -1, image: '', caption: { ru: '', en: '' }, col_start: 1, col_span: 5, offset_y: 0, parallax_speed: 0.15, reveal_progress: 0.1, sort_order: 1 },
    { id: -2, image: '', caption: { ru: '', en: '' }, col_start: 8, col_span: 4, offset_y: 80, parallax_speed: -0.25, reveal_progress: 0.2, sort_order: 2 },
    { id: -3, image: '', caption: { ru: '', en: '' }, col_start: 3, col_span: 6, offset_y: 220, parallax_speed: 0.10, reveal_progress: 0.35, sort_order: 3 },
    { id: -4, image: '', caption: { ru: '', en: '' }, col_start: 9, col_span: 4, offset_y: 360, parallax_speed: -0.20, reveal_progress: 0.5, sort_order: 4 },
    { id: -5, image: '', caption: { ru: '', en: '' }, col_start: 1, col_span: 4, offset_y: 500, parallax_speed: 0.05, reveal_progress: 0.65, sort_order: 5 },
    { id: -6, image: '', caption: { ru: '', en: '' }, col_start: 7, col_span: 5, offset_y: 620, parallax_speed: -0.15, reveal_progress: 0.8, sort_order: 6 },
  ];
}

/* ================================================================ */
/* 4. FACTS — крупные цифры в тёмном блоке, плавное появление.      */
/* ================================================================ */
function FactsStage({ lang, reduced, t }: { lang: 'ru' | 'en'; reduced: boolean; t: (k: string) => string }) {
  /* Берём fact1..fact4 из site_settings; если 4-го нет — дополняем дефолтом. */
  const facts = [1, 2, 3, 4].map((i) => ({
    num: t(`fact${i}_number`) || ['1784', '28', '1 200', 'XIX'][i - 1],
    label: t(`fact${i}_label`) || ['Год постройки', 'Коринфских колонн', 'Мест в Колонном зале', 'Век великих премьер'][i - 1],
  }));

  return (
    <Section tone="ink" spacing="md" bordered>
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-paper/55">
            {lang === 'ru' ? 'В цифрах' : 'In figures'}
          </span>
          <h2 className="mt-4 font-heading text-[clamp(36px,4.5vw,72px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-paper">
            {lang === 'ru' ? 'Архитектура и масштаб' : 'Architecture and scale'}
          </h2>
        </div>
        <div className="md:col-span-7">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-x-10 md:gap-y-14">
            {facts.map((f, i) => (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
              >
                <div className="font-heading text-[clamp(48px,6vw,104px)] font-bold uppercase leading-[0.86] tracking-[-0.01em] tabular-nums text-paper">
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
                  <p className={['mt-3 max-w-[44ch] text-base leading-7 text-ink-soft', isLeft ? 'md:ml-auto' : ''].join(' ')}>
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

/* ── Утилиты ──────────────────────────────────────────────────── */
function clamp01(x: number) {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}
function clampInt(x: number, min: number, max: number) {
  const v = Math.round(x);
  return Math.max(min, Math.min(max, v));
}
