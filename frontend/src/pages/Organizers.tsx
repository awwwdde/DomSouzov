import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function Organizers() {
  const { lang } = useSite();

  const services = {
    ru: [
      { num: 'N° 01', title: 'Аренда Колонного зала', desc: '1 200 мест. Коринфские колонны. Пять хрустальных люстр. Оркестровая сцена.' },
      { num: 'N° 02', title: 'Октябрьский зал', desc: '480 мест. Камерные концерты, лекции, пресс-конференции, приёмы.' },
      { num: 'N° 03', title: 'Съёмки и сессии', desc: 'Историческая фактура: мрамор, хрусталь, лепнина. По согласованию графика.' },
    ],
    en: [
      { num: 'N° 01', title: 'Hall of Columns hire', desc: '1,200 seats. Corinthian columns. Five crystal chandeliers. Orchestra stage.' },
      { num: 'N° 02', title: 'October Hall', desc: '480 seats. Chamber concerts, lectures, press conferences, receptions.' },
      { num: 'N° 03', title: 'Filming & sessions', desc: 'Historical textures: marble, crystal, stucco. Subject to schedule.' },
    ],
  };

  const steps = {
    ru: [
      { n: '01', ev: 'Запрос', dc: 'Форма на сайте или письмо. Указываются дата, формат, количество гостей.' },
      { n: '02', ev: 'Просмотр', dc: 'Очный осмотр зала, обсуждение технических требований и сцены.' },
      { n: '03', ev: 'Договор', dc: 'Согласование сметы, подписание договора, бронирование даты.' },
      { n: '04', ev: 'Проведение', dc: 'Сопровождение технической командой Дома. Поддержка в день мероприятия.' },
    ],
    en: [
      { n: '01', ev: 'Enquiry', dc: 'Website form or email. Date, format, and guest count.' },
      { n: '02', ev: 'Site visit', dc: 'On-site walk-through, technical requirements and stage plan.' },
      { n: '03', ev: 'Agreement', dc: 'Cost estimate, contract, date held.' },
      { n: '04', ev: 'Event', dc: 'Full support from the House technical crew on the day.' },
    ],
  };

  const tech = {
    ru: [
      { n: '01', title: 'Звук', desc: 'Линейный массив L-Acoustics, студийная запись, мобильный пульт.' },
      { n: '02', title: 'Свет', desc: 'Программируемый световой комплекс, архитектурная подсветка.' },
      { n: '03', title: 'Видео', desc: 'LED-экран 8×4 м, четыре PTZ-камеры, прямая трансляция.' },
      { n: '04', title: 'Сцена', desc: 'Концертный рояль Steinway D, оркестровые пюпитры, подиум.' },
    ],
    en: [
      { n: '01', title: 'Sound', desc: 'L-Acoustics line array, studio recording, mobile console.' },
      { n: '02', title: 'Lighting', desc: 'Programmable lighting rig, architectural uplight.' },
      { n: '03', title: 'Video', desc: 'LED wall 8×4 m, four PTZ cameras, live streaming.' },
      { n: '04', title: 'Stage', desc: 'Steinway D concert grand, orchestral stands, podium.' },
    ],
  };

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Организаторам' : 'Home · For Organizers'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Организаторам' : 'For Organizers'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Аренда залов Дома Союзов для концертов, конференций, торжественных мероприятий и съёмок. Коринфская архитектура, акустика класса A, вместимость до 1 200 человек.'
            : 'Hire the halls of the House of Unions for concerts, conferences, ceremonies and filming. Corinthian architecture, class A acoustics, capacity up to 1,200.'}
        </p>
      </section>

      <div className="org-services">
        {services[lang].map((s) => (
          <div key={s.num} className="service">
            <div className="num mono">{s.num}</div>
            <h3 className="serif">{s.title}</h3>
            <p>{s.desc}</p>
            <Link to="/contacts" className="btn service-cta">
              {lang === 'ru' ? 'ЗАПРОС' : 'ENQUIRE'} →
            </Link>
          </div>
        ))}
      </div>

      <section className="block">
        <h2>{lang === 'ru' ? 'Процесс бронирования' : 'Booking process'}</h2>
        <div className="timeline">
          {steps[lang].map((s) => (
            <div key={s.n} className="tl-row">
              <div className="yr serif">{s.n}</div>
              <div className="ev">{s.ev}</div>
              <div className="dc">{s.dc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <h2>{lang === 'ru' ? 'Техническое оснащение' : 'Technical equipment'}</h2>
        <div className="info-grid">
          {tech[lang].map((t) => (
            <div key={t.n} className="cell">
              <div className="num">{t.n}</div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
