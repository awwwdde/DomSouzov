import { useSite } from '../context/SiteContext';
import { RevealSection } from '../components/Reveal';

export default function Contacts() {
  const { lang, t } = useSite();

  return (
    <>
      <RevealSection className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Контакты' : 'Home · Contacts'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Контакты' : 'Contacts'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Билетная касса, аренда, пресс-служба, администрация — все контакты и часы работы.'
            : 'Box office, hire, press, administration — contacts and opening hours.'}
        </p>
      </RevealSection>

      <RevealSection className="contacts-layout">
        <div className="l">
          <div className="mono contacts-label">
            {lang === 'ru' ? 'Расположение' : 'Location'}
          </div>
          <h2 className="serif contacts-title">
            {lang === 'ru' ? 'Москва · Большая Дмитровка 1' : 'Moscow · Bolshaya Dmitrovka 1'}
          </h2>
          <dl className="contacts-dl">
            <dt>{lang === 'ru' ? 'Касса' : 'Box office'}</dt>
            <dd>
              {t('phone')}<br />
              <span className="contacts-subline">{lang === 'ru' ? 'Вт–Вс · 10:00—21:30' : 'Tue–Sun · 10:00—21:30'}</span>
            </dd>
            <dt>{lang === 'ru' ? 'Аренда' : 'Hire'}</dt>
            <dd>
              {t('email_rent')}<br />
              <span className="contacts-subline">+7 (495) 000-11-11</span>
            </dd>
            <dt>{lang === 'ru' ? 'Пресса' : 'Press'}</dt>
            <dd>{t('email_press')}</dd>
            <dt>{lang === 'ru' ? 'Метро' : 'Metro'}</dt>
            <dd>{t('metro_ru')}</dd>
            <dt>{lang === 'ru' ? 'Часы' : 'Hours'}</dt>
            <dd>
              {t('hours_ru')}<br />
              <span className="contacts-subline">{lang === 'ru' ? 'Понедельник — выходной' : 'Monday — closed'}</span>
            </dd>
          </dl>
          <div className="contacts-actions">
            <button className="btn solid">{lang === 'ru' ? 'ПОСТРОИТЬ МАРШРУТ' : 'DIRECTIONS'} →</button>
            <a href={`mailto:${t('email_rent')}`} className="btn">{lang === 'ru' ? 'НАПИСАТЬ' : 'EMAIL'}</a>
          </div>
        </div>
        <div className="r">
          <div className="map-ph">{lang === 'ru' ? '[ КАРТА · МОСКВА ]' : '[ MAP · MOSCOW ]'}</div>
        </div>
      </RevealSection>
    </>
  );
}
