import { useSite } from '../context/SiteContext';

export default function Contacts() {
  const { lang, t } = useSite();

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Контакты' : 'Home · Contacts'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Контакты' : 'Contacts'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Билетная касса, аренда, пресс-служба, администрация — все контакты и часы работы.'
            : 'Box office, hire, press, administration — contacts and opening hours.'}
        </p>
      </section>

      <section className="contacts-layout">
        <div className="l">
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {lang === 'ru' ? 'Расположение' : 'Location'}
          </div>
          <h2 className="serif" style={{ fontSize: '44px', fontWeight: 400, margin: '8px 0 24px', letterSpacing: '-0.02em' }}>
            {lang === 'ru' ? 'Москва · Большая Дмитровка 1' : 'Moscow · Bolshaya Dmitrovka 1'}
          </h2>
          <dl className="contacts-dl">
            <dt>{lang === 'ru' ? 'Касса' : 'Box office'}</dt>
            <dd>
              {t('phone')}<br />
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{lang === 'ru' ? 'Вт–Вс · 10:00—21:30' : 'Tue–Sun · 10:00—21:30'}</span>
            </dd>
            <dt>{lang === 'ru' ? 'Аренда' : 'Hire'}</dt>
            <dd>
              {t('email_rent')}<br />
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>+7 (495) 000-11-11</span>
            </dd>
            <dt>{lang === 'ru' ? 'Пресса' : 'Press'}</dt>
            <dd>{t('email_press')}</dd>
            <dt>{lang === 'ru' ? 'Метро' : 'Metro'}</dt>
            <dd>{t('metro_ru')}</dd>
            <dt>{lang === 'ru' ? 'Часы' : 'Hours'}</dt>
            <dd>
              {t('hours_ru')}<br />
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{lang === 'ru' ? 'Понедельник — выходной' : 'Monday — closed'}</span>
            </dd>
          </dl>
          <div style={{ marginTop: '32px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn solid">{lang === 'ru' ? 'ПОСТРОИТЬ МАРШРУТ' : 'DIRECTIONS'} →</button>
            <a href={`mailto:${t('email_rent')}`} className="btn">{lang === 'ru' ? 'НАПИСАТЬ' : 'EMAIL'}</a>
          </div>
        </div>
        <div className="r">
          <div className="map-ph">{lang === 'ru' ? '[ КАРТА · МОСКВА ]' : '[ MAP · MOSCOW ]'}</div>
        </div>
      </section>
    </>
  );
}
