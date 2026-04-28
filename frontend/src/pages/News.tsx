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

      <div className="news-list">
        {news.map((article, i) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            className="news-row-link"
          >
            <div className="mono news-row-index">
              N° 0{i + 1}
            </div>
            <div>
              <div className="mono news-row-tag">
                {l(article.tag)}
              </div>
              <h3 className="serif news-row-title">
                {l(article.title)}
              </h3>
            </div>
            <p className="news-row-excerpt">
              {l(article.excerpt)}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
