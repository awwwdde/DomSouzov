import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';
import NewsStripList from '../components/NewsStripList';
import { formatNewsShortDate } from '../lib/newsDates';

export default function News() {
  const { lang, content, t: tr } = useSite();
  const news = content?.news ?? [];
  const heroTitle = tr('news_title') || (lang === 'ru' ? 'Хроники' : 'Journal');
  const heroLead = tr('news_lead') || (lang === 'ru'
    ? 'Журнал Дома Союзов: события, интервью, репортажи, история места.'
    : 'The House of Unions journal: events, interviews, features, the history of the place.');

  return (
    <>
      <Seo title={`${heroTitle} — Дом Союзов`} description={heroLead} path="news" lang={lang} />
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Хроники' : 'Home · Journal'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {heroTitle}
          </h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">{heroLead}</p>
      </RevealSection>

      <div className="bg-paper px-5 pb-20 md:px-12">
        <NewsStripList
          articles={news}
          lang={lang}
          getDayMonth={(a) => formatNewsShortDate(a, lang)}
        />
      </div>
    </>
  );
}
