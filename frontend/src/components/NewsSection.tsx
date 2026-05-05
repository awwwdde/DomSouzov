import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import ActionButton from './ActionButton';

export default function NewsSection() {
  const { lang, content } = useSite();
  const news = content?.news ?? [];
  const lead = news.find((n) => n.is_lead);
  const secondary = news.filter((n) => !n.is_lead).slice(0, 2);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <section className="px-6 md:px-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Журнал · События · Интервью' : 'Notes · Events · Interviews'}
          </div>
          <h2 className="font-heading text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{lang === 'ru' ? 'Хроники' : 'Journal'}</h2>
        </div>
        <div>
          <ActionButton to="/news" text={`${lang === 'ru' ? 'Архив' : 'Archive'} →`} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        {lead && (
          <Link to={`/news/${lead.id}`} className="grid gap-4 border border-line bg-white p-4 md:col-span-1 md:row-span-2">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-paper">
              {lead.image ? (
                <img className="h-full w-full object-cover" src={lead.image} alt={l(lead.title)} />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">[ {l(lead.tag)} ]</div>
              )}
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              <span>{l(lead.tag)}</span>
              <span>N° 01</span>
            </div>
            <h3 className="font-heading text-[clamp(34px,4vw,64px)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">{l(lead.title)}</h3>
            <p className="leading-7 text-ink-soft">{l(lead.excerpt)}</p>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
              {lang === 'ru' ? 'ЧИТАТЬ' : 'READ'} →
            </span>
          </Link>
        )}

        {secondary.map((article, i) => (
          <Link key={article.id} to={`/news/${article.id}`} className="grid gap-4 border border-line bg-white p-4">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-paper">
              {article.image ? (
                <img className="h-full w-full object-cover" src={article.image} alt={l(article.title)} />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">[ {l(article.tag)} ]</div>
              )}
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              <span>{l(article.tag)}</span>
              <span>N° 0{i + 2}</span>
            </div>
            <h3 className="font-heading text-4xl font-semibold uppercase leading-none tracking-[-0.03em]">{l(article.title)}</h3>
            <p className="leading-7 text-ink-soft">{l(article.excerpt)}</p>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
              {lang === 'ru' ? 'ЧИТАТЬ' : 'READ'} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
