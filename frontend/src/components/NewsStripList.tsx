import { Link } from 'react-router-dom';
import type { NewsArticle } from '../types';
import { useReducedMotionActive } from '../lib/motion';
import { imgAttrs } from '../lib/img';

/* ============================================================ */
/* Сетка новостей: 3 одинаковые карточки в ряд → перенос на     */
/* следующую строку (2 — планшет, 1 — мобайл). Все карточки      */
/* выровнены: фиксированная пропорция фото (4:3, object-cover —  */
/* одинаковая ширина, без искажений) + зарезервированная высота  */
/* заголовка.                                                    */
/*                                                              */
/* Производительность (страница «Новости» подвисала при скролле):*/
/* исходники фото очень большие (до 6000×4000). При длинном      */
/* списке браузер декодировал их все сразу. content-visibility:  */
/* auto + contain-intrinsic-size пропускают отрисовку и декод    */
/* карточек за пределами вьюпорта — скролл остаётся плавным.     */
/* ============================================================ */

export function NewsCard({
  article,
  lang,
  dayMonth,
}: {
  article: NewsArticle;
  lang: 'ru' | 'en';
  dayMonth: string;
}) {
  const reduced = useReducedMotionActive();
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const title = l(article.title);
  const tag = l(article.tag);
  const excerpt = l(article.excerpt);

  return (
    <Link
      to={`/news/${article.id}`}
      className="group flex flex-col"
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 460px' }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-soft">
        {article.image ? (
          <img
            {...imgAttrs(article.image, '(min-width:1024px) 31vw, (min-width:640px) 46vw, 100vw', 640)}
            alt={title}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover ${reduced ? '' : 'transition-transform duration-[700ms] ease-ds group-hover:scale-[1.04]'}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center font-heading text-sm font-bold uppercase tracking-wider text-muted">
            {title}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-3 border-b border-ink pb-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
          {tag}
        </span>
        <time
          className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] tabular-nums text-ink-soft"
          dateTime={article.created_at ?? undefined}
        >
          {dayMonth}
        </time>
      </div>

      <h2 className="mt-4 line-clamp-3 min-h-[3.75em] font-heading text-[clamp(16px,1.15vw,19px)] font-bold uppercase leading-[1.25] tracking-[0.02em] text-ink transition group-hover:text-accent">
        {title}
      </h2>

      {excerpt ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-soft">{excerpt}</p>
      ) : null}
    </Link>
  );
}

export default function NewsStripList({
  articles,
  lang,
  getDayMonth,
}: {
  articles: NewsArticle[];
  lang: 'ru' | 'en';
  getDayMonth: (a: NewsArticle) => string;
}) {
  if (!articles.length) {
    return (
      <p className="border-t border-line py-10 text-center text-sm text-muted">
        {lang === 'ru' ? 'Материалов пока нет.' : 'No stories yet.'}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 pt-12 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <NewsCard key={a.id} article={a} lang={lang} dayMonth={getDayMonth(a)} />
      ))}
    </div>
  );
}
