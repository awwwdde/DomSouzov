import { useSite } from '../context/SiteContext';
import HallsPreview from '../components/HallsPreview';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

export default function Halls() {
  const { lang } = useSite();

  return (
    <>
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Главная · Залы' : 'Home · Halls'}</div>
          <h1 className="font-heading text-[clamp(64px,10vw,150px)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">{lang === 'ru' ? 'Залы' : 'Halls'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Два исторических зала. Коринфские колонны и пять хрустальных люстр в главном — камерная плотность в Октябрьском. Каждый зал может быть арендован.'
            : 'Two historic halls. Corinthian columns and five crystal chandeliers in the principal; chamber intimacy in the October. Each hall is available for hire.'}
        </p>
      </RevealSection>

      <HallsPreview />

      <RevealSection className="px-6 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{lang === 'ru' ? 'План и посадка' : 'Layout & seating'}</h2>
        <RevealList className="grid gap-3 md:grid-cols-2">
          <RevealItem>
            <div className="min-h-[320px] rounded-2xl bg-paper">
              <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {lang === 'ru' ? '[ СХЕМА КОЛОННОГО ЗАЛА · ПАРТЕР + ЯРУСЫ ]' : '[ HALL OF COLUMNS PLAN · STALLS + TIERS ]'}
              </div>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="min-h-[320px] rounded-2xl bg-paper">
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
