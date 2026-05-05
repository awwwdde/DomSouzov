import { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

const CATS = {
  ru: ['Все', 'Архитектура', 'Концерты', 'Реставрация', 'Архив'],
  en: ['All', 'Architecture', 'Concerts', 'Restoration', 'Archive'],
};

const GALLERY_PH = [
  { label_ru: 'КОЛОННЫЙ ЗАЛ · ГЛАВНЫЙ', label_en: 'HALL OF COLUMNS · MAIN', span: 'span2 span2h', cat_ru: 'Архитектура', cat_en: 'Architecture' },
  { label_ru: 'ФАСАД', label_en: 'FACADE', span: '', cat_ru: 'Архитектура', cat_en: 'Architecture' },
  { label_ru: 'ХРУСТАЛЬНАЯ ЛЮСТРА', label_en: 'CRYSTAL CHANDELIER', span: '', cat_ru: 'Архитектура', cat_en: 'Architecture' },
  { label_ru: 'АРХИВ · 1910', label_en: 'ARCHIVE · 1910', span: '', cat_ru: 'Архив', cat_en: 'Archive' },
  { label_ru: 'РЕПЕТИЦИЯ', label_en: 'REHEARSAL', span: '', cat_ru: 'Концерты', cat_en: 'Concerts' },
  { label_ru: 'КОНЦЕРТ · ВИД ИЗ ЯРУСА', label_en: 'CONCERT · VIEW FROM TIER', span: 'span2', cat_ru: 'Концерты', cat_en: 'Concerts' },
  { label_ru: 'БЕЛЫЙ МРАМОР', label_en: 'WHITE MARBLE', span: '', cat_ru: 'Архитектура', cat_en: 'Architecture' },
  { label_ru: 'ДИРИЖЁР', label_en: 'CONDUCTOR', span: '', cat_ru: 'Концерты', cat_en: 'Concerts' },
  { label_ru: 'ФОЙЕ', label_en: 'FOYER', span: '', cat_ru: 'Архитектура', cat_en: 'Architecture' },
  { label_ru: 'ТОРЖЕСТВЕННЫЙ ПРИЁМ', label_en: 'FORMAL RECEPTION', span: '', cat_ru: 'Концерты', cat_en: 'Concerts' },
  { label_ru: 'КУЛИСЫ · ШИРОКИЙ ПЛАН', label_en: 'BACKSTAGE · WIDE SHOT', span: 'span2', cat_ru: 'Концерты', cat_en: 'Concerts' },
];

export default function Gallery() {
  const { lang, content } = useSite();
  const [cat, setCat] = useState(0);

  const galleryItems = content?.gallery && content.gallery.length > 0
    ? content.gallery
    : null;

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const spanClass = (span?: string | null) => [
    span?.includes('span2') ? 'md:col-span-2' : '',
    span?.includes('span2h') ? 'md:row-span-2' : '',
  ].filter(Boolean).join(' ');

  const filtered = galleryItems
    ? (cat === 0 ? galleryItems : galleryItems.filter((g) =>
        cat === 0 ||
        (lang === 'ru' ? g.category.ru : g.category.en) === CATS[lang][cat]
      ))
    : GALLERY_PH.filter((g) => cat === 0 || (lang === 'ru' ? g.cat_ru : g.cat_en) === CATS[lang][cat]);

  return (
    <>
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Главная · Галерея' : 'Home · Gallery'}</div>
          <h1 className="font-heading text-[clamp(64px,10vw,150px)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">{lang === 'ru' ? 'Галерея' : 'Gallery'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Архитектура, концерты, закулисье и реставрация. Исторические снимки и съёмки современных постановок.'
            : 'Architecture, concerts, backstage and restoration. Historical photography and contemporary productions.'}
        </p>
      </RevealSection>

      <RevealSection className="flex flex-wrap items-center gap-2 px-6 md:px-12" y={14}>
        <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'РУБРИКА' : 'CATEGORY'}</span>
        {CATS[lang].map((c, i) => (
          <button key={i} className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${cat === i ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:bg-paper'}`} onClick={() => setCat(i)}>{c}</button>
        ))}
      </RevealSection>

      <RevealList className="grid auto-rows-[220px] gap-3 px-6 md:grid-cols-4 md:px-12">
        {galleryItems
          ? (filtered as typeof galleryItems).map((g) => (
              <RevealItem key={g.id} className={spanClass(g.span)}>
                <div className="group relative h-full overflow-hidden rounded-2xl bg-paper">
                  {g.image ? (
                    <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={g.image} alt={l(g.caption)} />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">{l(g.caption)}</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs font-bold uppercase tracking-[0.12em] text-white">{l(g.caption)}</div>
                </div>
              </RevealItem>
            ))
          : (filtered as typeof GALLERY_PH).map((g, i) => (
              <RevealItem key={i} className={spanClass(g.span)}>
                <div className="relative h-full overflow-hidden rounded-2xl bg-paper">
                  <div className="flex h-full items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">{lang === 'ru' ? g.label_ru : g.label_en}</div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs font-bold uppercase tracking-[0.12em] text-white">{lang === 'ru' ? g.label_ru : g.label_en}</div>
                </div>
              </RevealItem>
            ))
        }
      </RevealList>
    </>
  );
}
