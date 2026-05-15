import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';
import ActionButton from '../components/ActionButton';

export default function Halls() {
  const { lang, content } = useSite();
  const halls = content?.halls ?? [];

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <>
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Залы' : 'Home · Halls'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {lang === 'ru' ? 'Залы' : 'Halls'}
          </h1>
        </div>
        <div className="flex flex-col items-start gap-6 self-end md:items-end">
          <p className="max-w-2xl text-lg leading-8 text-ink-soft md:text-right">
            {lang === 'ru'
              ? 'Два исторических зала. Коринфские колонны и пять хрустальных люстр в главном — камерная плотность в Октябрьском. Каждый зал может быть арендован.'
              : 'Two historic halls. Corinthian columns and five crystal chandeliers in the principal; chamber intimacy in the October. Each hall is available for hire.'}
          </p>
          <ActionButton
            to="/organizers"
            text={lang === 'ru' ? 'Аренда и условия' : 'Hire & terms'}
            backgroundColor="#2f5d50"
            textColor="#f7f7f2"
          />
        </div>
      </RevealSection>

      <RevealList className="mx-auto max-w-[1600px]">
        {halls.map((hall, i) => (
          <RevealItem key={hall.id}>
            <article className="grid gap-0 border-b border-line md:grid-cols-2">
              <div
                className={`relative aspect-[4/3] min-h-[280px] overflow-hidden bg-paper-soft md:min-h-[360px] ${
                  i % 2 === 1 ? 'md:order-2' : ''
                }`}
              >
                {hall.image ? (
                  <img src={hall.image} alt={l(hall.name)} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    {l(hall.name)}
                  </div>
                )}
              </div>

              <div
                className={`flex flex-col justify-center border-line bg-paper p-8 md:p-12 lg:p-16 ${
                  i % 2 === 1 ? 'md:order-1 md:border-r' : 'md:border-l'
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block h-px w-10 bg-accent" aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                    {lang === 'ru' ? `Зал № ${String(i + 1).padStart(2, '0')}` : `Hall ${String(i + 1).padStart(2, '0')}`}
                  </span>
                </div>
                <h2 className="font-heading text-[clamp(36px,5vw,84px)] font-bold uppercase leading-[0.92] tracking-[0.03em] text-ink">
                  {l(hall.name)}
                </h2>
                <dl className="mt-8 space-y-2 text-sm text-ink-soft">
                  <div className="flex gap-2">
                    <dt className="min-w-[10rem] text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      {lang === 'ru' ? 'Вместимость' : 'Capacity'}
                    </dt>
                    <dd>{hall.capacity}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="min-w-[10rem] text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      {lang === 'ru' ? 'Площадь' : 'Area'}
                    </dt>
                    <dd>{hall.area}</dd>
                  </div>
                  {hall.columns ? (
                    <div className="flex gap-2">
                      <dt className="min-w-[10rem] text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                        {lang === 'ru' ? 'Колонны' : 'Columns'}
                      </dt>
                      <dd>{hall.columns}</dd>
                    </div>
                  ) : null}
                </dl>
                <p className="mt-6 max-w-prose text-sm leading-7 text-ink-soft">{l(hall.description)}</p>
                <div className="mt-10">
                  <Link
                    to="/organizers"
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink transition hover:text-accent"
                  >
                    {lang === 'ru' ? 'Подробнее об аренде' : 'More about hire'}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealList>

      <RevealSection className="border-t border-line px-5 py-16 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">
          {lang === 'ru' ? 'План и посадка' : 'Layout & seating'}
        </h2>
        <RevealList className="grid gap-6 md:grid-cols-2">
          <RevealItem>
            <div className="min-h-[320px] border border-line bg-paper">
              <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {lang === 'ru' ? '[ СХЕМА КОЛОННОГО ЗАЛА · ПАРТЕР + ЯРУСЫ ]' : '[ HALL OF COLUMNS PLAN · STALLS + TIERS ]'}
              </div>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="min-h-[320px] border border-line bg-paper">
              <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {lang === 'ru' ? '[ СХЕМА ОКТЯБРЬСКОГО ЗАЛА ]' : '[ OCTOBER HALL PLAN ]'}
              </div>
            </div>
          </RevealItem>
        </RevealList>
      </RevealSection>
    </>
  );
}
