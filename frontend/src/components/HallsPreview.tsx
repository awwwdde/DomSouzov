import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import './HallsPreview.css';

export default function HallsPreview() {
  const { lang, content } = useSite();
  const halls = content?.halls ?? [];

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <section className="halls-preview">
      <div className="section-head" style={{ borderBottom: '1px solid var(--ink)' }}>
        <div>
          <div className="kicker mono">
            {lang === 'ru' ? '2 зала · Коринфский ордер · Акустика A' : '2 halls · Corinthian order · Acoustic class A'}
          </div>
          <h2 className="serif">{lang === 'ru' ? 'Залы' : 'Halls'}</h2>
        </div>
        <div className="r">
          <Link to="/organizers" className="btn">
            {lang === 'ru' ? 'АРЕНДА' : 'RENT'} →
          </Link>
        </div>
      </div>

      <div className="halls-grid">
        {halls.map((hall, i) => (
          <Link key={hall.id} to="/halls" className="hall-card">
            <div className="hall-top">
              <span className="mono">N° 0{i + 1} / 0{halls.length}</span>
              <span className="mono">{l(hall.features)}</span>
            </div>
            <div className="hall-content">
              <h3 className="hall-name serif">{l(hall.name)}</h3>
              <div className="ph-img hall-ph"></div>
            </div>
            <div className="hall-specs">
              <div className="spec">
                <strong className="serif">{hall.capacity.split(' ')[0]}</strong>
                <div className="spec-label mono">{lang === 'ru' ? 'Мест' : 'Seats'}</div>
              </div>
              <div className="spec">
                <strong className="serif">{hall.area.split(' ')[0]}</strong>
                <div className="spec-label mono">{lang === 'ru' ? 'Площадь м²' : 'Area m²'}</div>
              </div>
              <div className="spec">
                <strong className="serif">{hall.columns ?? '—'}</strong>
                <div className="spec-label mono">{lang === 'ru' ? 'Колонн' : 'Columns'}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
