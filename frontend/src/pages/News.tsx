import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function News() {
  const { lang, content } = useSite();
  const news = content?.news ?? [];
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Хроники' : 'Home · Journal'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Хроники' : 'Journal'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Журнал Дома Союзов: события, интервью, репортажи, история места.'
            : 'The House of Unions journal: events, interviews, features, the history of the place.'}
        </p>
      </section>

      <div style={{ borderBottom: '1px solid var(--ink)' }}>
        {news.map((article, i) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 280px',
              gap: '24px',
              padding: '28px 48px',
              borderBottom: '1px solid var(--ink)',
              textDecoration: 'none',
              color: 'var(--ink)',
              transition: 'background 0.18s',
              alignItems: 'center',
            }}
            className="news-row-link"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          >
            <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--muted)' }}>
              N° 0{i + 1}
            </div>
            <div>
              <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                {l(article.tag)}
              </div>
              <h3 className="serif" style={{ fontSize: '28px', fontWeight: 500, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                {l(article.title)}
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
              {l(article.excerpt)}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
