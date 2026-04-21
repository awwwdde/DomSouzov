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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ aspectRatio: '16/10', border: '1px solid var(--ink)', background: '#F5F3EE', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.24em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              {lang === 'ru' ? '[ СХЕМА КОЛОННОГО ЗАЛА · ПАРТЕР + ЯРУСЫ ]' : '[ HALL OF COLUMNS PLAN · STALLS + TIERS ]'}
            </div>
          </div>
          <div style={{ aspectRatio: '16/10', border: '1px solid var(--ink)', background: '#F5F3EE', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.24em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              {lang === 'ru' ? '[ СХЕМА ОКТЯБРЬСКОГО ЗАЛА ]' : '[ OCTOBER HALL PLAN ]'}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
