import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { PageKicker } from './PageKicker';
import { RevealItem, RevealList, RevealSection } from './Reveal';
import ActionButton from './ActionButton';

export default function HallsPreview() {
  const { lang, content } = useSite();
  const halls = (content?.halls ?? []).filter((h) => !h.rider_only);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <RevealSection className="border-t border-line px-5 py-16 md:px-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <PageKicker>{lang === 'ru' ? '2 зала · Коринфский ордер · Акустика A' : '2 halls · Corinthian order · Acoustic class A'}</PageKicker>
          <h2 className="font-heading text-[clamp(48px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">{lang === 'ru' ? 'Залы' : 'Halls'}</h2>
        </div>
        <div>
          <ActionButton to="/organizers" text={`${lang === 'ru' ? 'Подробнее' : 'Details'} →`} />
        </div>
      </div>

      <RevealList className="grid min-h-[420px] gap-3 md:grid-cols-2">
        {halls.map((hall, i) => (
          <RevealItem key={hall.id}>
            <Link to="/halls" className="flex min-h-full flex-col gap-5 border border-line bg-paper p-5 transition duration-200 ease-ds hover:border-ink/30">
              <div className="flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <span>N° 0{i + 1} / 0{halls.length}</span>
                <span>{l(hall.features)}</span>
              </div>
              <div className="grid gap-5">
                <h3 className="font-heading text-[clamp(42px,5vw,78px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">{l(hall.name)}</h3>
                <div className="min-h-56 overflow-hidden border border-line bg-paper-soft">
                  {hall.image ? (
                    <img className="h-full min-h-56 w-full object-cover" src={hall.image} alt={l(hall.name)} />
                  ) : (
                    <div className="flex min-h-56 items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">
                      [ {l(hall.name)} ]
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-3">
                <div className="border-t border-line pt-3">
                  <strong className="font-heading text-4xl font-semibold leading-none">{hall.capacity.split(' ')[0]}</strong>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{lang === 'ru' ? 'Мест' : 'Seats'}</div>
                </div>
                <div className="border-t border-line pt-3">
                  <strong className="font-heading text-4xl font-semibold leading-none">{hall.area.split(' ')[0]}</strong>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{lang === 'ru' ? 'Площадь м²' : 'Area m²'}</div>
                </div>
                <div className="border-t border-line pt-3">
                  <strong className="font-heading text-4xl font-semibold leading-none">{hall.columns ?? '—'}</strong>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{lang === 'ru' ? 'Колонн' : 'Columns'}</div>
                </div>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealList>
    </RevealSection>
  );
}
