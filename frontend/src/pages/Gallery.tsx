import { useState } from 'react';
import { useSite } from '../context/SiteContext';

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

  const filtered = galleryItems
    ? (cat === 0 ? galleryItems : galleryItems.filter((g) =>
        cat === 0 ||
        (lang === 'ru' ? g.category.ru : g.category.en) === CATS[lang][cat]
      ))
    : GALLERY_PH.filter((g) => cat === 0 || (lang === 'ru' ? g.cat_ru : g.cat_en) === CATS[lang][cat]);

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Галерея' : 'Home · Gallery'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Галерея' : 'Gallery'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Архитектура, концерты, закулисье и реставрация. Исторические снимки и съёмки современных постановок.'
            : 'Architecture, concerts, backstage and restoration. Historical photography and contemporary productions.'}
        </p>
      </section>

      <div className="filters">
        <span className="label mono">{lang === 'ru' ? 'РУБРИКА' : 'CATEGORY'}</span>
        {CATS[lang].map((c, i) => (
          <button key={i} className={`chip${cat === i ? ' active' : ''}`} onClick={() => setCat(i)}>{c}</button>
        ))}
      </div>

      <div className="gal-grid">
        {galleryItems
          ? (filtered as typeof galleryItems).map((g) => (
              <div key={g.id} className={`cell${g.span ? ' ' + g.span : ''}`}>
                {g.image ? (
                  <img src={g.image} alt={l(g.caption)} />
                ) : (
                  <div className="cell-ph">{l(g.caption)}</div>
                )}
                <div className="cell-overlay">{l(g.caption)}</div>
              </div>
            ))
          : (filtered as typeof GALLERY_PH).map((g, i) => (
              <div key={i} className={`cell${g.span ? ' ' + g.span : ''}`}>
                <div className="cell-ph">{lang === 'ru' ? g.label_ru : g.label_en}</div>
                <div className="cell-overlay">{lang === 'ru' ? g.label_ru : g.label_en}</div>
              </div>
            ))
        }
      </div>
    </>
  );
}
