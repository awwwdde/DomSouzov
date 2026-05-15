import { Link } from 'react-router-dom';
import type { NewsArticle } from '../types';
import { useReducedMotionActive } from '../lib/motion';

function TagDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
      <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      {label}
    </span>
  );
}

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
    <article className="group relative grid gap-0 border-b border-line bg-paper transition-colors hover:bg-paper-soft md:grid-cols-[minmax(0,280px)_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper-soft md:border-b-0 md:border-r md:border-line">
        {article.image ? (
          <img
            src={article.image}
            alt={title}
            className={`h-full w-full object-cover ${reduced ? '' : 'transition-transform duration-[900ms] ease-ds group-hover:scale-[1.04]'}`}
          />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center p-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted">
            {l(article.tag)}
          </div>
        )}
      </div>

      <div className="pointer-events-none relative flex flex-col justify-center gap-5 p-5 md:p-8">
        <Link to={`/news/${article.id}`} className="absolute inset-0 z-0" aria-label={title} />
        <div className="relative z-[1] flex flex-wrap items-start justify-between gap-4">
          <TagDot label={l(article.tag)} />
          <time className="font-heading text-[clamp(22px,2.2vw,32px)] font-bold leading-none tracking-[0.01em] text-ink" dateTime={article.created_at ?? undefined}>
            {dayMonth}
          </time>
        </div>
        <h2 className="relative z-[1] font-heading text-[clamp(18px,2.2vw,28px)] font-bold uppercase leading-tight tracking-[0.04em] transition-colors duration-[900ms] ease-ds group-hover:text-accent md:max-w-[50ch]">
          {title}
        </h2>
        <p className="relative z-[1] line-clamp-3 text-sm leading-6 text-ink-soft">{l(article.excerpt)}</p>
      </div>
    </article>
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
        {lang === 'ru' ? 'Нет материалов по выбранным фильтрам.' : 'No stories match the filters.'}
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
