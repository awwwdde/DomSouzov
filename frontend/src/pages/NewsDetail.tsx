import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { NewsArticle } from '../types';
import { getNewsItem } from '../api/client';
import Reveal, { RevealSection } from '../components/Reveal';
import ActionButton from '../components/ActionButton';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, content } = useSite();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    if (!id) return;
    const fromCache = content?.news.find((n) => n.id === Number(id));
    if (fromCache) { setArticle(fromCache); return; }
    getNewsItem(Number(id)).then(setArticle).catch(() => {});
  }, [id, content]);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  if (!article) {
    return <div className="px-6 pt-28 text-sm text-muted md:px-12">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</div>;
  }

  return (
    <>
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.2fr_0.8fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            <Link to="/">{lang === 'ru' ? 'Главная' : 'Home'}</Link>
            {' · '}
            <Link to="/news">{lang === 'ru' ? 'Хроники' : 'Journal'}</Link>
            {' · '}
            {l(article.tag)}
          </div>
          <h1 className="font-heading text-[clamp(54px,8vw,124px)] font-semibold uppercase leading-[0.84] tracking-[-0.06em]">{l(article.title)}</h1>
        </div>
        <div className="self-end">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {l(article.tag)}
          </div>
          <p className="text-xl leading-8 text-ink-soft">
            {l(article.excerpt)}
          </p>
        </div>
      </RevealSection>

      <Reveal className="grid gap-8 px-6 md:grid-cols-[1fr_280px] md:px-12">
        <article>
          {article.image && (
            <div className="mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-paper">
              <img className="h-full w-full object-cover" src={article.image} alt={l(article.title)} />
            </div>
          )}
          <div className="max-w-3xl space-y-5 text-lg leading-8 text-ink-soft">
            {l(article.content)
              .split('\n')
              .filter(Boolean)
              .map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </article>

        <aside className="h-fit border border-line bg-white p-5">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Рубрика' : 'Category'}
          </div>
          <div className="mb-5 font-heading text-3xl font-semibold uppercase leading-none">{l(article.tag)}</div>
          <ActionButton to="/news" text={`← ${lang === 'ru' ? 'Все статьи' : 'All articles'}`} />
        </aside>
      </Reveal>
    </>
  );
}
