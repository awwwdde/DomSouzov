import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import type { NewsArticle } from '../types';
import { getNewsItem } from '../api/client';
import { PageKicker } from '../components/PageKicker';
import Seo, { SITE_NAME, SITE_URL } from '../components/Seo';
import ActionButton from '../components/ActionButton';
import Lightbox, { type LightboxItem } from '../components/Lightbox';
import { formatNewsLongDate, formatNewsShortDate } from '../lib/newsDates';
import { parseContentBlocks, firstTextBlock } from '../lib/richText';
import { fadeUp, transitionBase, useReducedMotionActive } from '../lib/motion';

function mediaUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, content } = useSite();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const reduced = useReducedMotionActive();

  useEffect(() => {
    if (!id) return;
    const fromCache = content?.news.find((n) => n.id === Number(id));
    if (fromCache) {
      setArticle(fromCache);
      return;
    }
    getNewsItem(Number(id)).then(setArticle).catch(() => {});
  }, [id, content]);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  const gallery = useMemo(() => (article?.gallery ?? []).filter((m) => m && m.url), [article]);
  /** Лайтбокс — только для фото; видео проигрывается прямо в карточке. */
  const imageUrls = useMemo(() => gallery.filter((m) => m.type !== 'video').map((m) => m.url), [gallery]);

  const lightboxItems: LightboxItem[] = useMemo(() => {
    if (!article) return [];
    return imageUrls.map((src) => ({ src: mediaUrl(src), alt: l(article.title) }));
  }, [article, imageUrls, lang]);

  if (!article) {
    return (
      <div className="px-5 pt-28 text-sm text-muted md:px-12 md:pt-32">
        {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  const dayHeader = formatNewsShortDate(article, lang);
  const contentBlocks = parseContentBlocks(l(article.content));
  const excerpt = l(article.excerpt).trim();

  const related = (content?.news ?? [])
    .filter((n) => n.id !== article.id && n.tag.ru === article.tag.ru)
    .slice(0, 3);

  const seoDesc = excerpt || firstTextBlock(contentBlocks).slice(0, 200) || l(article.title);
  const seoImage = article.image ? mediaUrl(article.image) : undefined;

  const openImage = (url: string) => {
    const i = imageUrls.indexOf(url);
    if (i >= 0) {
      setLightboxIndex(i);
      setLightboxOpen(true);
    }
  };

  return (
    <>
      <Seo
        title={`${l(article.title)} · ${SITE_NAME}`}
        description={seoDesc}
        path={`news/${article.id}`}
        image={seoImage}
        type="article"
        lang={lang}
        keywords={[l(article.tag), l(article.title), 'новости Дома Союзов', 'афиша Москва']}
        articleTags={[l(article.tag)]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: l(article.title),
            description: seoDesc,
            image: seoImage ? (seoImage.startsWith('http') ? seoImage : `${SITE_URL}${seoImage}`) : undefined,
            articleSection: l(article.tag),
            inLanguage: lang === 'ru' ? 'ru-RU' : 'en-US',
            datePublished: article.created_at ?? undefined,
            dateModified: article.created_at ?? undefined,
            author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-house.svg` },
            },
            mainEntityOfPage: `${SITE_URL}/news/${article.id}`,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: lang === 'ru' ? 'Главная' : 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: lang === 'ru' ? 'Архив мероприятий' : 'Events archive', item: `${SITE_URL}/news` },
              { '@type': 'ListItem', position: 3, name: l(article.title), item: `${SITE_URL}/news/${article.id}` },
            ],
          },
        ]}
      />

      {/* Шапка — как у афиши */}
      <header className="border-b border-line bg-paper px-5 pb-10 pt-28 md:px-12 md:pb-14 md:pt-32">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <PageKicker>
              <Link to="/">{lang === 'ru' ? 'Главная' : 'Home'}</Link>
              {' · '}
              <Link to="/news">{lang === 'ru' ? 'Новости' : 'News'}</Link>
              {' · '}
              <span>{l(article.tag)}</span>
            </PageKicker>
            <h1 className="font-heading text-[clamp(44px,7vw,104px)] font-bold uppercase leading-[0.9] tracking-[0.03em] text-ink">
              {l(article.title)}
            </h1>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {lang === 'ru' ? 'Дата' : 'Date'}
            </div>
            <div className="mt-2 font-heading text-[clamp(22px,3vw,36px)] font-bold tabular-nums text-ink">{dayHeader}</div>
          </div>
        </div>
      </header>

      {/* Раскладка (ПК):                              Моб. порядок:
            ┌ обложка ─┬ инфо ─┐                         обложка
            ├ галерея ─┼ текст ┤                         текст
            └──────────┴───────┘                         галерея → инфо
          Текст справа-внизу «прилипает» (sticky): при 100+ фото слева
          текст остаётся на месте. Длинный текст решается сам — текст и
          галерея растут вниз в своих рядах. */}
      {/* Раскладка ПК: слева обложка + галерея (растут вниз), справа —
          текст + инфо, «прилипающие» (sticky) при скролле. Левая медиа-колонка
          выше правой, поэтому у sticky-колонки есть место — она корректно
          фиксируется под хедером, а не уезжает за него. */}
      <section className="mx-auto grid max-w-[1600px] gap-10 px-5 py-12 md:px-12 lg:grid-cols-[1.15fr_minmax(0,460px)] lg:items-start lg:gap-x-14">
        {/* Левая колонка: обложка + галерея */}
        <div className="flex flex-col gap-8">
          {/* Обложка */}
          <div className="w-full overflow-hidden border border-line bg-paper-soft">
            {article.image ? (
              <img
                src={mediaUrl(article.image)}
                alt={l(article.title)}
                loading="lazy"
                decoding="async"
                className="w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center p-6 text-center font-heading text-2xl font-bold uppercase tracking-[0.04em] text-muted">
                {l(article.title)}
              </div>
            )}
          </div>

          {/* Галерея доп. медиа (фото и видео, опционально) */}
          {gallery.length > 0 ? (
            <div className="flex flex-col gap-4">
              {gallery.map((m, gi) =>
                m.type === 'video' ? (
                  <motion.div
                    key={`${m.url}-${gi}`}
                    className="w-full overflow-hidden border border-line bg-ink"
                    variants={fadeUp(reduced)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    transition={reduced ? { duration: 0 } : transitionBase}
                  >
                    <video
                      src={mediaUrl(m.url)}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full"
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    key={`${m.url}-${gi}`}
                    type="button"
                    onClick={() => openImage(m.url)}
                    className="group block w-full overflow-hidden border border-line bg-paper-soft"
                    variants={fadeUp(reduced)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    transition={reduced ? { duration: 0 } : transitionBase}
                  >
                    <img
                      src={mediaUrl(m.url)}
                      alt={l(article.title)}
                      loading="lazy"
                      decoding="async"
                      className="w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                    />
                  </motion.button>
                )
              )}
            </div>
          ) : null}
        </div>

        {/* Правая колонка: текст + инфо — sticky на ПК */}
        <div className="flex flex-col gap-8 border-t border-line pt-8 lg:sticky lg:top-28 lg:self-start lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {/* Текст статьи */}
          <div className="space-y-4 text-center text-[14px] leading-[1.7] text-ink-soft">
            {contentBlocks.length > 0
              ? contentBlocks.map((b, i) =>
                  b.type === 'image' ? (
                    <img
                      key={i}
                      src={mediaUrl(b.url)}
                      alt={b.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full"
                    />
                  ) : (
                    <p key={i}>{b.value}</p>
                  )
                )
              : excerpt
                ? <p>{excerpt}</p>
                : null}
          </div>

          {/* Инфо о новости: дата, рубрика, кнопка */}
          <aside className="flex flex-col gap-6 border-t border-line pt-8">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{lang === 'ru' ? 'Дата' : 'Date'}</dt>
                <dd className="mt-1 text-ink-soft">{formatNewsLongDate(article, lang) || dayHeader}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{lang === 'ru' ? 'Рубрика' : 'Category'}</dt>
                <dd className="mt-1 text-ink-soft">{l(article.tag)}</dd>
              </div>
            </dl>
            <ActionButton to="/news" text={lang === 'ru' ? 'Все новости' : 'All news'} />
          </aside>
        </div>
      </section>

      {/* Похожие новости */}
      {related.length > 0 ? (
        <section className="border-t border-line bg-paper px-5 py-16 md:px-12">
          <div className="mx-auto max-w-[1600px]">
            <h2 className="mb-10 font-heading text-[clamp(28px,4vw,56px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
              {lang === 'ru' ? 'Ещё новости' : 'More news'}
            </h2>
            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {related.map((nw) => (
                <Link key={nw.id} to={`/news/${nw.id}`} className="group flex flex-col">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-soft">
                    {nw.image ? (
                      <img
                        src={mediaUrl(nw.image)}
                        alt={l(nw.title)}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3 border-b border-ink pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft">
                    <span>{l(nw.tag)}</span>
                    <span className="tabular-nums">{formatNewsShortDate(nw, lang)}</span>
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-bold uppercase leading-[1.1] tracking-[0.02em] text-ink transition group-hover:text-accent">
                    {l(nw.title)}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Lightbox
        open={lightboxOpen && lightboxItems.length > 0}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
