import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';
import Lightbox, { type LightboxItem } from '../components/Lightbox';
import { fadeUp, transitionBase, useReducedMotionActive } from '../lib/motion';

function mediaUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export default function GalleryCategory() {
  const { slug } = useParams();
  const { lang, content } = useSite();
  const reduced = useReducedMotionActive();
  const gallery = content?.gallery ?? [];
  const categories = content?.gallery_categories ?? [];

  const l = (obj?: { ru: string; en: string }) => (obj ? obj[lang] || obj.ru : '');
  const cat = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);
  const catName = cat ? l(cat.name) : '';

  const items = useMemo(
    () => (cat ? gallery.filter((g) => g.image && g.category_id === cat.id) : []),
    [gallery, cat],
  );

  const photoSlides: LightboxItem[] = useMemo(
    () => items.filter((g) => !g.is_video).map((g) => ({ src: mediaUrl(g.image), alt: l(g.caption), caption: l(g.caption) || undefined })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, lang],
  );

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const openImage = (img: string) => {
    const i = photoSlides.findIndex((s) => s.src === mediaUrl(img));
    if (i >= 0) {
      setIdx(i);
      setOpen(true);
    }
  };

  if (!cat) {
    return (
      <RevealSection className="flex min-h-[60vh] flex-col justify-center border-b border-line bg-paper px-5 py-28 md:px-12">
        <Seo title={lang === 'ru' ? 'Раздел не найден — Галерея' : 'Section not found'} path={`gallery/${slug}`} lang={lang} noindex />
        <PageKicker>{lang === 'ru' ? 'Галерея' : 'Gallery'}</PageKicker>
        <h1 className="mt-4 font-heading text-[clamp(40px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">
          {lang === 'ru' ? 'Раздел не найден' : 'Section not found'}
        </h1>
        <Link to="/gallery" className="mt-8 inline-flex text-[11px] font-bold uppercase tracking-[0.18em] text-ink underline underline-offset-4 hover:text-accent">
          ← {lang === 'ru' ? 'К галерее' : 'Back to gallery'}
        </Link>
      </RevealSection>
    );
  }

  return (
    <>
      <Seo
        title={`${catName} — Галерея · Дом Союзов`}
        description={lang === 'ru' ? `${catName}: фотографии Дома Союзов.` : `${catName}: photographs of the House of Unions.`}
        path={`gallery/${cat.slug}`}
        image={items[0]?.image ? mediaUrl(items[0].image) : undefined}
        lang={lang}
      />

      {/* HERO */}
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-12 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-14 md:pt-32">
        <div>
          <PageKicker>
            <Link to="/gallery" className="hover:text-accent">{lang === 'ru' ? 'Галерея' : 'Gallery'}</Link>
            {' · '}
            <span>{catName}</span>
          </PageKicker>
          <h1 className="font-heading text-[clamp(48px,8vw,128px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {catName}
          </h1>
        </div>
        <p className="self-end text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          {items.length} {lang === 'ru' ? 'снимков' : 'photos'}
        </p>
      </RevealSection>

      {/* MASONRY */}
      <section className="px-5 py-12 md:px-12 md:py-16">
        {items.length === 0 ? (
          <p className="border-y border-line py-16 text-center text-sm text-muted">
            {lang === 'ru' ? 'В этой теме пока нет снимков.' : 'No photos in this theme yet.'}
          </p>
        ) : (
          <div className="gap-4 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4">
            {items.map((g, i) => {
              const isVideo = !!g.is_video && !!g.video_url;
              const caption = l(g.caption);
              const inner = (
                <>
                  <img
                    src={mediaUrl(g.image)}
                    alt={caption}
                    loading="lazy"
                    decoding="async"
                    className="w-full object-cover transition duration-700 ease-ds group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  {caption ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 text-[12px] font-bold uppercase tracking-[0.12em] text-paper opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {caption}
                    </div>
                  ) : null}
                  {isVideo ? (
                    <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent/90 text-paper shadow-lg transition group-hover:scale-110">
                      <Play size={22} strokeWidth={1.8} className="ml-0.5" />
                    </span>
                  ) : null}
                </>
              );
              const cls = 'group relative block w-full break-inside-avoid overflow-hidden border border-line bg-paper-soft';
              return (
                <motion.div
                  key={g.id}
                  variants={fadeUp(reduced)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                  transition={reduced ? { duration: 0 } : { ...transitionBase, delay: Math.min((i % 8) * 0.04, 0.3) }}
                >
                  {isVideo ? (
                    <a href={mediaUrl(g.video_url)} target="_blank" rel="noopener noreferrer" className={cls} aria-label={caption || 'video'}>
                      {inner}
                    </a>
                  ) : (
                    <button type="button" onClick={() => openImage(g.image)} className={`${cls} text-left`} aria-label={caption || 'photo'}>
                      {inner}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 border-t border-line pt-8">
          <Link to="/gallery" className="inline-flex text-[11px] font-bold uppercase tracking-[0.18em] text-ink underline underline-offset-4 transition hover:text-accent">
            ← {lang === 'ru' ? 'Все темы' : 'All themes'}
          </Link>
        </div>
      </section>

      <Lightbox open={open} onClose={() => setOpen(false)} items={photoSlides} index={idx} onIndexChange={setIdx} />
    </>
  );
}
