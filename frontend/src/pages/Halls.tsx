import { useSite } from '../context/SiteContext';
import HallsPreview from '../components/HallsPreview';

export default function Halls() {
  const { lang } = useSite();

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Залы' : 'Home · Halls'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Залы' : 'Halls'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Два исторических зала. Коринфские колонны и пять хрустальных люстр в главном — камерная плотность в Октябрьском. Каждый зал может быть арендован.'
            : 'Two historic halls. Corinthian columns and five crystal chandeliers in the principal; chamber intimacy in the October. Each hall is available for hire.'}
        </p>
      </section>

      <HallsPreview />

      <section className="block">
        <h2>{lang === 'ru' ? 'План и посадка' : 'Layout & seating'}</h2>
        <div className="hall-plans">
          <div className="ph-img hall-plan-ph">
            <div className="hall-plan-label mono">
              {lang === 'ru' ? '[ СХЕМА КОЛОННОГО ЗАЛА · ПАРТЕР + ЯРУСЫ ]' : '[ HALL OF COLUMNS PLAN · STALLS + TIERS ]'}
            </div>
          </div>
          <div className="ph-img hall-plan-ph">
            <div className="hall-plan-label mono">
              {lang === 'ru' ? '[ СХЕМА ОКТЯБРЬСКОГО ЗАЛА ]' : '[ OCTOBER HALL PLAN ]'}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
