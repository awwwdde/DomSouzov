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
import { formatNewsLongDate } from '../lib/newsDates';
import { maskLineReveal, transitionBase, useReducedMotionActive } from '../lib/motion';

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

  const lightboxItems: LightboxItem[] = useMemo(() => {
    if (!article?.image) return [];
    return [
      {
        src: mediaUrl(article.image),
        alt: l(article.title),
      },
    ];
  }, [article, lang]);

  if (!article) {
    return (
      <div className="px-5 pt-28 text-sm text-muted md:px-12 md:pt-32">
        {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  const pub = formatNewsLongDate(article, lang);

  const seoDesc = (l(article.excerpt).trim() || l(article.content).trim().slice(0, 200)) || l(article.title);
  const seoImage = article.image ? mediaUrl(article.image) : undefined;

  return (
    <>
      <Seo
        title={`${l(article.title)} · ${SITE_NAME}`}
        description={seoDesc}
        path={`news/${article.id}`}
        image={seoImage}
        type="article"
        lang={lang}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: l(article.title),
          description: seoDesc,
          image: seoImage ? (seoImage.startsWith('http') ? seoImage : `${SITE_URL}${seoImage}`) : undefined,
          datePublished: article.created_at ?? undefined,
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          mainEntityOfPage: `${SITE_URL}/news/${article.id}`,
        }}
      />
      <header className="border-b border-line bg-paper px-5 pb-10 pt-28 md:px-12 md:pb-14 md:pt-32">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <PageKicker>
              <Link to="/">{lang === 'ru' ? 'Главная' : 'Home'}</Link>
              {' · '}
              <Link to="/news">{lang === 'ru' ? 'Хроники' : 'Journal'}</Link>
              {' · '}
              <span>{l(article.tag)}</span>
            </PageKicker>
            <h1 className="font-heading text-[clamp(52px,9vw,124px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
              {l(article.title)}
            </h1>
            {l(article.excerpt).trim() ? (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg">{l(article.excerpt)}</p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {lang === 'ru' ? 'Дата' : 'Date'}
            </div>
            <time
              className="mt-2 block font-heading text-[clamp(20px,2.5vw,32px)] font-bold tabular-nums text-ink"
              dateTime={article.created_at ?? undefined}
            >
              {pub || '—'}
            </time>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:gap-16">
          <div className="space-y-8">
            {article.image ? (
              <motion.button
                type="button"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                variants={maskLineReveal(reduced)}
                transition={transitionBase}
                className="relative block w-full overflow-hidden border border-line bg-paper text-left"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={mediaUrl(article.image)}
                  alt={l(article.title)}
                  className="aspect-[4/3] w-full object-cover"
                />
              </motion.button>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <PageKicker>{lang === 'ru' ? 'Материал' : 'Article'}</PageKicker>
            <div className="mb-8 border-b border-line pb-8 text-sm text-ink-soft">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {lang === 'ru' ? 'Рубрика' : 'Category'}
              </div>
              <div className="mt-2 font-heading text-2xl font-bold uppercase tracking-[0.04em]">{l(article.tag)}</div>
            </div>
            <div className="max-w-prose space-y-5 text-[15px] leading-[1.65] text-ink-soft">
              {l(article.content)
                .split('\n')
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
            <div className="mt-10">
              <ActionButton to="/news" text={`← ${lang === 'ru' ? 'Все материалы' : 'All articles'}`} />
            </div>
          </aside>
        </div>
      </section>

      <Lightbox
        open={lightboxOpen && lightboxItems.length > 0}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        index={0}
        onIndexChange={() => {}}
      />
    </>
  );
}
