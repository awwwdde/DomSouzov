import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import type { GalleryImage } from '../types';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';
import Lightbox, { type LightboxItem } from '../components/Lightbox';
import { maskLineReveal, transitionBase, useReducedMotionActive } from '../lib/motion';

function mediaUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export default function GalleryCategory() {
  const { slug } = useParams();
  const { lang, content } = useSite();
  const reduced = useReducedMotionActive();
  const categories = content?.gallery_categories ?? [];
  const gallery = content?.gallery ?? [];

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug]
  );

  const items = useMemo(() => {
    if (!category) return [] as GalleryImage[];
    return gallery.filter((g) => {
      if (g.category_id != null) return g.category_id === category.id;
      const catLabel = lang === 'ru' ? g.category.ru : g.category.en;
      const name = lang === 'ru' ? category.name.ru : category.name.en;
      return catLabel === name;
    });
  }, [gallery, category, lang]);

  const slides: LightboxItem[] = useMemo(
    () =>
      items.map((g) => {
        const cap = l(g.caption);
        const img = mediaUrl(g.image);
        if (g.is_video && g.video_url) {
          return {
            src: img || mediaUrl(g.video_url),
            alt: cap,
            caption: cap,
            videoSrc: mediaUrl(g.video_url),
          };
        }
        return { src: img, alt: cap, caption: cap };
      }),
    [items, l]
  );

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const openAt = (g: GalleryImage) => {
    const i = items.findIndex((x) => x.id === g.id);
    if (i >= 0) {
      setIdx(i);
      setOpen(true);
    }
  };

  if (!category) {
    return (
      <RevealSection className="min-h-[50vh] border-b border-line bg-paper px-5 py-28 md:px-12">
        <PageKicker>{lang === 'ru' ? 'Галерея' : 'Gallery'}</PageKicker>
        <h1 className="mt-4 font-heading text-[clamp(40px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">
          {lang === 'ru' ? 'Раздел не найден' : 'Section not found'}
        </h1>
        <Link
          to="/gallery"
          className="mt-8 inline-flex text-[10px] font-bold uppercase tracking-[0.18em] text-ink underline-offset-4 transition hover:underline hover:underline-offset-4"
        >
          ← {lang === 'ru' ? 'К галерее' : 'Back to gallery'}
        </Link>
      </RevealSection>
    );
  }

  return (
    <>
      <Seo
        title={`${l(category.name)} — Галерея · Дом Союзов`}
        description={
          lang === 'ru'
            ? `${l(category.name)} — фотогалерея Дома Союзов.`
            : `${l(category.name)} — photo gallery of the House of Unions.`
        }
        path={`gallery/${category.slug}`}
        image={category.cover_image || undefined}
        lang={lang}
      />
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>
            {lang === 'ru' ? `Галерея · ${l(category.name)}` : `Gallery · ${l(category.name)}`}
          </PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {l(category.name)}
          </h1>
        </div>
        <div className="flex flex-col items-start gap-4 self-end">
          <p className="max-w-2xl text-lg leading-8 text-ink-soft">
            {lang === 'ru'
              ? 'Нажмите на кадр, чтобы открыть полноэкранный просмотр.'
              : 'Click a frame to open fullscreen view.'}
          </p>
          <Link
            to="/gallery"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted transition hover:underline hover:underline-offset-4"
          >
            ← {lang === 'ru' ? 'Все разделы' : 'All sections'}
          </Link>
        </div>
      </RevealSection>

      <div className="mx-auto max-w-[1600px] columns-1 gap-4 px-5 py-12 sm:columns-2 md:columns-3 lg:columns-4 md:px-12">
        {items.map((g, index) => (
          <motion.figure
            key={g.id}
            className="mb-4 break-inside-avoid"
            initial={reduced ? false : 'hidden'}
            whileInView={reduced ? undefined : 'show'}
            viewport={{ once: true, amount: 0.12 }}
            variants={maskLineReveal(reduced)}
            transition={{
              ...transitionBase,
              delay: reduced ? 0 : index * 0.08,
            }}
          >
            <button
              type="button"
              className="group relative w-full overflow-hidden border border-line bg-paper text-left"
              onClick={() => openAt(g)}
            >
              {g.is_video && g.video_url ? (
                <>
                  {g.image ? (
                    <img
                      src={mediaUrl(g.image)}
                      alt={l(g.caption)}
                      className={`w-full object-cover ${reduced ? '' : 'transition duration-500 group-hover:scale-[1.02]'}`}
                    />
                  ) : (
                    <div className="aspect-video w-full bg-ink/5" />
                  )}
                  <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/25"
                    aria-hidden
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-paper/80 text-paper">
                      ▶
                    </span>
                  </span>
                </>
              ) : (
                <img
                  src={mediaUrl(g.image)}
                  alt={l(g.caption)}
                  className={`w-full object-cover ${reduced ? '' : 'transition duration-500 group-hover:scale-[1.02]'}`}
                />
              )}
              {l(g.caption) ? (
                <figcaption className="border-t border-line bg-paper px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                  {l(g.caption)}
                </figcaption>
              ) : null}
            </button>
          </motion.figure>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="px-5 pb-20 text-center text-sm text-ink-soft md:px-12">
          {lang === 'ru' ? 'В этом разделе пока нет кадров.' : 'No frames in this section yet.'}
        </p>
      ) : null}

      <Lightbox open={open} onClose={() => setOpen(false)} items={slides} index={idx} onIndexChange={setIdx} />
    </>
  );
}
