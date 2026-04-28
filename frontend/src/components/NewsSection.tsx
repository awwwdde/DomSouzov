import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function NewsSection() {
  const { lang, content } = useSite();
  const news = content?.news ?? [];
  const lead = news.find((n) => n.is_lead);
  const secondary = news.filter((n) => !n.is_lead).slice(0, 2);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <section className="news-section">
      <div className="section-head">
        <div>
          <div className="kicker mono">
            {lang === 'ru' ? 'Журнал · События · Интервью' : 'Notes · Events · Interviews'}
          </div>
          <h2 className="serif">{lang === 'ru' ? 'Хроники' : 'Journal'}</h2>
        </div>
        <div className="r">
          <Link to="/news" className="btn">
            {lang === 'ru' ? 'АРХИВ' : 'ARCHIVE'} →
          </Link>
        </div>
      </div>

      <div className="news-grid">
        {lead && (
          <Link to={`/news/${lead.id}`} className="news-item news-lead">
            <div className="ph-img news-ph news-ph-lead">
              {lead.image ? (
                <img src={lead.image} alt={l(lead.title)} />
              ) : (
                <div className="ph-label">[ {l(lead.tag)} ]</div>
              )}
            </div>
            <div className="news-meta mono">
              <span>{l(lead.tag)}</span>
              <span>N° 01</span>
            </div>
            <h3 className="news-title serif">{l(lead.title)}</h3>
            <p className="news-excerpt">{l(lead.excerpt)}</p>
            <span className="news-read mono">
              {lang === 'ru' ? 'ЧИТАТЬ' : 'READ'} →
            </span>
          </Link>
        )}

        {secondary.map((article, i) => (
          <Link key={article.id} to={`/news/${article.id}`} className="news-item">
            <div className="ph-img news-ph news-ph-item">
              {article.image ? (
                <img src={article.image} alt={l(article.title)} />
              ) : (
                <div className="ph-label">[ {l(article.tag)} ]</div>
              )}
            </div>
            <div className="news-meta mono">
              <span>{l(article.tag)}</span>
              <span>N° 0{i + 2}</span>
            </div>
            <h3 className="news-title serif">{l(article.title)}</h3>
            <p className="news-excerpt">{l(article.excerpt)}</p>
            <span className="news-read mono">
              {lang === 'ru' ? 'ЧИТАТЬ' : 'READ'} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
