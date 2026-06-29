import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

function mediaUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export default function Gallery() {
  const { lang, content, t } = useSite();
  const categories = content?.gallery_categories ?? [];
  const items = content?.gallery ?? [];

  const title = t('gallery_title') || (lang === 'ru' ? 'Галерея' : 'Gallery');
  const lead =
    t('gallery_lead') ||
    (lang === 'ru'
      ? 'Архитектура, залы, мероприятия и история Дома Союзов. Выберите тему — откроется коллекция снимков.'
      : 'Architecture, halls, events and the history of the House of Unions. Pick a theme to open the collection.');

  const l = (obj?: { ru: string; en: string }) => (obj ? obj[lang] || obj.ru : '');

  // Блоки = категории из админки, у которых есть хотя бы одно фото.
  const blocks = useMemo(() => {
    return categories
      .map((c) => {
        const photos = items.filter((g) => g.image && g.category_id === c.id);
        return { c, cover: c.cover_image || photos[0]?.image || '', count: photos.length };
      })
      .filter((b) => b.count > 0)
      .sort((a, b) => a.c.order - b.c.order);
  }, [categories, items]);

  return (
    <>
      <Seo title={`${title} — Дом Союзов`} description={lead} path="gallery" lang={lang} keywords={['галерея', 'фото', 'интерьеры', 'съёмки']} />

      <RevealSection className="border-b border-line bg-paper px-5 pb-14 pt-28 md:px-12 md:pb-16 md:pt-32">
        <PageKicker>{lang === 'ru' ? 'Главная · Галерея' : 'Home · Gallery'}</PageKicker>
        <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
          {title}
        </h1>
      </RevealSection>

      {blocks.length === 0 ? (
        <section className="px-5 py-20 text-center text-sm text-muted md:px-12">
          {lang === 'ru'
            ? 'Снимки появятся здесь, как только их добавят в админке.'
            : 'Photos will appear here once added in the CMS.'}
        </section>
      ) : (
        <RevealList className="grid grid-cols-1 gap-4 px-5 pb-20 pt-10 sm:grid-cols-2 md:px-12 lg:grid-cols-3">
          {blocks.map(({ c, cover, count }) => (
            <RevealItem key={c.id}>
              <Link
                to={`/gallery/${c.slug}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden border border-line bg-paper-soft"
              >
                {cover ? (
                  <img
                    src={mediaUrl(cover)}
                    alt={l(c.name)}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] ease-ds group-hover:scale-[1.06]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent transition duration-500 group-hover:from-ink/90" />
                <div className="relative z-[1] flex items-end justify-between gap-4 p-6">
                  <div>
                    <span className="block font-heading text-[clamp(26px,3vw,44px)] font-bold uppercase leading-[0.95] tracking-[0.03em] text-paper">
                      {l(c.name)}
                    </span>
                    <span className="mt-2 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-paper/70">
                      {count} {lang === 'ru' ? photoWord(count) : count === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/40 text-paper transition group-hover:border-accent group-hover:bg-accent"
                  >
                    →
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealList>
      )}
    </>
  );
}

function photoWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'снимок';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'снимка';
  return 'снимков';
}
