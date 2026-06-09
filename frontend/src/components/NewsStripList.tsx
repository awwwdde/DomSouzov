import { Link } from 'react-router-dom';
import type { NewsArticle } from '../types';
import { useReducedMotionActive } from '../lib/motion';

export function NewsRowStrip({
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

  return (
    <Link
      to={`/news/${article.id}`}
      className="group grid border-b border-line bg-paper transition-colors hover:bg-paper-soft md:grid-cols-[minmax(0,280px)_1fr]"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper-soft md:border-b-0 md:border-r md:border-line">
        {article.image ? (
          <img
            src={article.image}
            alt={title}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover ${reduced ? '' : 'transition-transform duration-[900ms] ease-ds group-hover:scale-[1.04]'}`}
          />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center p-4 text-center font-heading text-sm font-bold uppercase tracking-wider text-muted">
            {title}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-5 p-5 md:p-8">
        <time
          className="font-heading text-[clamp(20px,2vw,30px)] font-bold leading-none tracking-[0.01em] text-ink"
          dateTime={article.created_at ?? undefined}
        >
          {dayMonth}
        </time>
        <h2 className="font-heading text-[clamp(18px,2.2vw,28px)] font-bold uppercase leading-tight tracking-[0.04em] text-ink transition-colors group-hover:text-accent md:max-w-[50ch]">
          {title}
        </h2>
        <p className="line-clamp-3 text-sm leading-6 text-ink-soft">{l(article.excerpt)}</p>
      </div>
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
      <p className="border-b border-line py-10 text-center text-sm text-muted">
        {lang === 'ru' ? 'Материалов пока нет.' : 'No stories yet.'}
      </p>
    );
  }
  return (
    <div className="border-t border-line">
      {articles.map((a) => (
        <NewsRowStrip key={a.id} article={a} lang={lang} dayMonth={getDayMonth(a)} />
      ))}
    </div>
  );
}
