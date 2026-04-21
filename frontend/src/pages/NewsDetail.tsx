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
          <h1 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>{l(article.title)}</h1>
        </div>
        <div>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
            {l(article.tag)}
          </div>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-2)', margin: 0 }}>
            {l(article.excerpt)}
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '56px', padding: '64px 48px', borderBottom: '1px solid var(--ink)' }}>
        <article>
          {article.image && (
            <div className="ph-img" style={{ aspectRatio: '16/9', border: '1px solid var(--ink)', marginBottom: '40px' }}>
              <img src={article.image} alt={l(article.title)} />
            </div>
          )}
          <div style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--ink-2)' }}>
            {l(article.content)
              .split('\n')
              .filter(Boolean)
              .map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </article>

        <aside style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
            {lang === 'ru' ? 'Рубрика' : 'Category'}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '32px', fontWeight: 500 }}>{l(article.tag)}</div>
          <Link to="/news" className="btn" style={{ display: 'inline-flex' }}>
            ← {lang === 'ru' ? 'ВСЕ СТАТЬИ' : 'ALL ARTICLES'}
          </Link>
        </aside>
      </div>
    </>
  );
}
