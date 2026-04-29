import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

export default function News() {
  const { lang, content } = useSite();
  const news = content?.news ?? [];
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <>
      <RevealSection className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Хроники' : 'Home · Journal'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Хроники' : 'Journal'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Журнал Дома Союзов: события, интервью, репортажи, история места.'
            : 'The House of Unions journal: events, interviews, features, the history of the place.'}
        </p>
      </RevealSection>

      <RevealList className="news-list">
        {news.map((article, i) => (
          <RevealItem key={article.id}>
            <Link
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
          </RevealItem>
        ))}
      </RevealList>
    </>
  );
}
