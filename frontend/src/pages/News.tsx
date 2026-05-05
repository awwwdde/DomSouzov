import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

export default function News() {
  const { lang, content } = useSite();
  const news = content?.news ?? [];
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <>
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Главная · Хроники' : 'Home · Journal'}</div>
          <h1 className="font-heading text-[clamp(64px,10vw,150px)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">{lang === 'ru' ? 'Хроники' : 'Journal'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Журнал Дома Союзов: события, интервью, репортажи, история места.'
            : 'The House of Unions journal: events, interviews, features, the history of the place.'}
        </p>
      </RevealSection>

      <RevealList className="grid px-6 md:px-12">
        {news.map((article, i) => (
          <RevealItem key={article.id}>
            <Link
              to={`/news/${article.id}`}
              className="grid gap-5 border-t border-line py-7 transition hover:bg-white/60 md:grid-cols-[90px_1.1fr_1fr]"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                N° 0{i + 1}
              </div>
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  {l(article.tag)}
                </div>
                <h3 className="font-heading text-[clamp(34px,4vw,64px)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
                  {l(article.title)}
                </h3>
              </div>
              <p className="self-end leading-7 text-ink-soft">
                {l(article.excerpt)}
              </p>
            </Link>
          </RevealItem>
        ))}
      </RevealList>
    </>
  );
}
