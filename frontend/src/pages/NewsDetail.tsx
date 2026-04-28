import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { NewsArticle } from '../types';
import { getNewsItem } from '../api/client';

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
    return <div className="block">{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</div>;
  }

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">
            <Link to="/">{lang === 'ru' ? 'Главная' : 'Home'}</Link>
            {' · '}
            <Link to="/news">{lang === 'ru' ? 'Хроники' : 'Journal'}</Link>
            {' · '}
            {l(article.tag)}
          </div>
          <h1 className="serif news-detail-title">{l(article.title)}</h1>
        </div>
        <div>
          <div className="mono news-detail-tag">
            {l(article.tag)}
          </div>
          <p className="news-detail-excerpt">
            {l(article.excerpt)}
          </p>
        </div>
      </section>

      <div className="news-detail-layout">
        <article className="news-detail-article">
          {article.image && (
            <div className="ph-img news-detail-image">
              <img src={article.image} alt={l(article.title)} />
            </div>
          )}
          <div className="news-detail-body">
            {l(article.content)
              .split('\n')
              .filter(Boolean)
              .map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </article>

        <aside className="news-detail-aside">
          <div className="mono news-detail-category-label">
            {lang === 'ru' ? 'Рубрика' : 'Category'}
          </div>
          <div className="news-detail-category-value">{l(article.tag)}</div>
          <Link to="/news" className="btn news-detail-back">
            ← {lang === 'ru' ? 'ВСЕ СТАТЬИ' : 'ALL ARTICLES'}
          </Link>
        </aside>
      </div>
    </>
  );
}
