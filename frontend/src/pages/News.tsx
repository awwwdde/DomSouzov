import { useMemo, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';
import NewsStripList from '../components/NewsStripList';
import { formatNewsShortDate, newsDateKey } from '../lib/newsDates';

export default function News() {
  const { lang, content, t: tr } = useSite();
  const news = content?.news ?? [];
  const heroTitle = tr('news_title') || (lang === 'ru' ? 'Хроники' : 'Journal');
  const heroLead = tr('news_lead') || (lang === 'ru'
    ? 'Журнал Дома Союзов: события, интервью, репортажи, история места.'
    : 'The House of Unions journal: events, interviews, features, the history of the place.');

  const [tagIdx, setTagIdx] = useState(0);
  const [dateKey, setDateKey] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    news.forEach((a) => set.add(lang === 'ru' ? a.tag.ru : a.tag.en));
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [lang === 'ru' ? 'Все' : 'All', ...list];
  }, [news, lang]);

  const uniqueDateKeys = useMemo(() => {
    const s = new Set<string>();
    news.forEach((a) => {
      const k = newsDateKey(a);
      if (k) s.add(k);
    });
    return Array.from(s).sort();
  }, [news]);

  const filtered = useMemo(() => {
    let list = news;
    if (tagIdx > 0) {
      const label = tags[tagIdx]!;
      list = list.filter((a) => (lang === 'ru' ? a.tag.ru : a.tag.en) === label);
    }
    if (dateKey) {
      list = list.filter((a) => newsDateKey(a) === dateKey);
    }
    return list;
  }, [news, tagIdx, tags, lang, dateKey]);

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

      <div className="sticky top-16 z-30 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm md:top-[72px] md:px-12">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              {lang === 'ru' ? 'Тема' : 'Topic'}
            </span>
            {tags.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTagIdx(i);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                  tagIdx === i ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink/30'
                }`}
              >
                <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              {lang === 'ru' ? 'Дата' : 'Date'}
            </span>
            <button
              type="button"
              onClick={() => setDateKey(null)}
              className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] ${
                dateKey === null ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink'
              }`}
            >
              {lang === 'ru' ? 'Все дни' : 'All days'}
            </button>
            {uniqueDateKeys.map((dk) => (
              <button
                key={dk}
                type="button"
                onClick={() => setDateKey(dk)}
                className={`rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] tabular-nums transition ${
                  dateKey === dk ? 'ring-2 ring-accent ring-offset-2 ring-offset-paper border-accent' : 'border-line bg-white'
                }`}
              >
                {dk.split('-').slice(1).reverse().join('.')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-paper px-5 pb-20 md:px-12">
        <NewsStripList
          articles={filtered}
          lang={lang}
          getDayMonth={(a) => formatNewsShortDate(a, lang)}
        />
      </div>
    </>
  );
}
