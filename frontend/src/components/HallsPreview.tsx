import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { RevealItem, RevealList, RevealSection } from './Reveal';
import ActionButton from './ActionButton';

export default function HallsPreview() {
  const { lang, content } = useSite();
  const halls = content?.halls ?? [];

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <RevealSection className="px-6 md:px-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? '2 зала · Коринфский ордер · Акустика A' : '2 halls · Corinthian order · Acoustic class A'}
          </div>
          <h2 className="font-heading text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{lang === 'ru' ? 'Залы' : 'Halls'}</h2>
        </div>
        <div>
          <ActionButton to="/organizers" text={`${lang === 'ru' ? 'Аренда' : 'Rent'} →`} />
        </div>
      </div>

      <RevealList className="grid min-h-[420px] gap-3 md:grid-cols-2">
        {halls.map((hall, i) => (
          <RevealItem key={hall.id}>
            <Link to="/halls" className="flex min-h-full flex-col gap-5 border border-line bg-white p-5 transition duration-200 ease-ds hover:-translate-y-1 hover:border-ink/25">
              <div className="flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <span>N° 0{i + 1} / 0{halls.length}</span>
                <span>{l(hall.features)}</span>
              </div>
              <div className="grid gap-5">
                <h3 className="font-heading text-[clamp(42px,5vw,78px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{l(hall.name)}</h3>
                <div className="min-h-56 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-400"></div>
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
