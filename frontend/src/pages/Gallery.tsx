import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useSite } from '../context/SiteContext';
import type { GalleryImage } from '../types';
import { PageKicker } from '../components/PageKicker';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';
import Lightbox, { type LightboxItem } from '../components/Lightbox';
import { useReducedMotionActive } from '../lib/motion';

const PLACEHOLDER = [
  { label_ru: 'КОЛОННЫЙ ЗАЛ', label_en: 'HALL OF COLUMNS' },
  { label_ru: 'ФАСАД', label_en: 'FACADE' },
] as const;

function mediaUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

function spanClass(span?: string | null) {
  return [
    span?.includes('span2') ? 'md:col-span-2' : '',
    span?.includes('span2h') ? 'md:row-span-2' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export default function Gallery() {
  const { lang, content, t } = useSite();
  const categories = content?.gallery_categories ?? [];
  const galleryItems = content?.gallery ?? [];
  const title = t('gallery_title') || (lang === 'ru' ? 'Галерея' : 'Gallery');
  const lead = t('gallery_lead') || (lang === 'ru'
    ? 'Разделы коллекции — перейдите в тему, чтобы открыть полную сетку снимков.'
    : 'Collection sections — open a theme to view the full image grid.');

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  if (categories.length > 0) {
    return (
      <>
        <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
          <div>
            <PageKicker>{lang === 'ru' ? 'Главная · Галерея' : 'Home · Gallery'}</PageKicker>
            <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
              {title}
            </h1>
          </div>
          <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">{lead}</p>
        </RevealSection>

        <RevealList className="mx-auto grid max-w-[1600px] gap-4 px-5 pb-20 md:grid-cols-2 md:px-12">
          {categories.map((c) => {
            const cover =
              c.cover_image ||
              galleryItems.find((g) => g.category_id === c.id && g.image)?.image ||
              galleryItems.find((g) => (lang === 'ru' ? g.category.ru : g.category.en) === l(c.name) && g.image)?.image;
            return (
              <RevealItem key={c.id}>
                <Link
                  to={`/gallery/${c.slug}`}
                  className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden border border-line bg-paper"
                >
                  {cover ? (
                    <img
                      src={mediaUrl(cover)}
                      alt={l(c.name)}
                      className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] ease-ds group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-paper text-xs font-bold uppercase tracking-wider text-muted">
                      {l(c.name)}
                    </div>
                  )}
                  <div className="relative z-[1] bg-gradient-to-t from-black/75 to-transparent p-5">
                    <span className="font-heading text-[clamp(22px,3vw,40px)] font-bold uppercase tracking-[0.04em] text-white">
                      {l(c.name)}
                    </span>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealList>
      </>
    );
  }

  return <LegacyGrid lang={lang} galleryItems={galleryItems} />;
}

function LegacyGrid({ lang, galleryItems }: { lang: 'ru' | 'en'; galleryItems: GalleryImage[] }) {
  const [cat, setCat] = useState(0);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const reduced = useReducedMotionActive();

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  const CATS = [lang === 'ru' ? 'Все' : 'All', 'Архитектура', 'Концерты', 'Реставрация', 'Архив'];

  const filtered = useMemo(() => {
    if (!galleryItems.length) return [];
    if (cat === 0) return galleryItems;
    const label = CATS[cat];
    return galleryItems.filter((g) => (lang === 'ru' ? g.category.ru : g.category.en) === label);
  }, [galleryItems, cat, CATS, lang]);

  const slides: LightboxItem[] = useMemo(
    () =>
      filtered
        .filter((g) => g.image)
        .map((g) => ({ src: mediaUrl(g.image), alt: l(g.caption) })),
    [filtered, l]
  );

  const openAt = (g: GalleryImage) => {
    const i = slides.findIndex((s) => s.src === mediaUrl(g.image));
    if (i >= 0) {
      setIdx(i);
      setOpen(true);
    }
  };

  return (
    <>
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Галерея' : 'Home · Gallery'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {lang === 'ru' ? 'Галерея' : 'Gallery'}
          </h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Добавьте категории в CMS для обложек разделов или фильтруйте снимки по рубрике.'
            : 'Add categories in the CMS for section covers, or filter shots by category.'}
        </p>
      </RevealSection>

      <RevealSection className="flex flex-wrap items-center gap-2 px-5 py-6 md:px-12" y={14}>
        <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          {lang === 'ru' ? 'РУБРИКА' : 'CATEGORY'}
        </span>
        {CATS.map((c, i) => (
          <button
            key={c}
            type="button"
            className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${cat === i ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:bg-paper'}`}
            onClick={() => setCat(i)}
          >
            {c}
          </button>
        ))}
      </RevealSection>

      <RevealList className="mx-auto grid auto-rows-[220px] max-w-[1600px] gap-3 px-5 pb-16 md:grid-cols-4 md:px-12">
        {galleryItems.length
          ? filtered.map((g) => (
              <RevealItem key={g.id} className={spanClass(g.span)}>
                <button
                  type="button"
                  className="group relative h-full w-full overflow-hidden border border-line bg-paper text-left"
                  onClick={() => openAt(g)}
                >
                  {g.image ? (
                    <img
                      className={`h-full w-full object-cover ${reduced ? '' : 'transition duration-500 group-hover:scale-105'}`}
                      src={mediaUrl(g.image)}
                      alt={l(g.caption)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">
                      {l(g.caption)}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs font-bold uppercase tracking-[0.12em] text-white">
                    {l(g.caption)}
                  </div>
                </button>
              </RevealItem>
            ))
          : PLACEHOLDER.map((g, i) => (
              <RevealItem key={i}>
                <div className="relative h-full overflow-hidden border border-line bg-paper">
                  <div className="flex h-full items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    {lang === 'ru' ? g.label_ru : g.label_en}
                  </div>
                </div>
              </RevealItem>
            ))}
      </RevealList>

      <Lightbox open={open} onClose={() => setOpen(false)} items={slides} index={idx} onIndexChange={setIdx} />
    </>
  );
}
