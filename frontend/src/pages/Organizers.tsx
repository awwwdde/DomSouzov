import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

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
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Главная · Организаторам' : 'Home · For Organizers'}</div>
          <h1 className="font-heading text-[clamp(64px,10vw,150px)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">{lang === 'ru' ? 'Организаторам' : 'For Organizers'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Аренда залов Дома Союзов для концертов, конференций, торжественных мероприятий и съёмок. Коринфская архитектура, акустика класса A, вместимость до 1 200 человек.'
            : 'Hire the halls of the House of Unions for concerts, conferences, ceremonies and filming. Corinthian architecture, class A acoustics, capacity up to 1,200.'}
        </p>
      </RevealSection>

      <RevealList className="grid gap-3 px-6 md:grid-cols-3 md:px-12">
        {services[lang].map((s) => (
          <RevealItem key={s.num}>
            <div className="flex min-h-full flex-col gap-4 border border-line bg-white p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{s.num}</div>
              <h3 className="font-heading text-[clamp(32px,4vw,58px)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">{s.title}</h3>
              <p className="leading-7 text-ink-soft">{s.desc}</p>
              <Link to="/contacts" className="mt-auto inline-flex text-xs font-bold uppercase tracking-[0.12em]">{lang === 'ru' ? 'Запрос' : 'Enquire'} →</Link>
            </div>
          </RevealItem>
        ))}
      </RevealList>

      <RevealSection className="px-6 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{lang === 'ru' ? 'Процесс бронирования' : 'Booking process'}</h2>
        <RevealList className="grid">
          {steps[lang].map((s) => (
            <RevealItem key={s.n}>
              <div className="grid gap-4 border-t border-line py-5 md:grid-cols-[120px_1fr_2fr]">
                <div className="font-heading text-5xl font-semibold leading-none">{s.n}</div>
                <div className="font-semibold">{s.ev}</div>
                <div className="leading-7 text-ink-soft">{s.dc}</div>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>

      <RevealSection className="px-6 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{lang === 'ru' ? 'Техническое оснащение' : 'Technical equipment'}</h2>
        <RevealList className="grid gap-3 md:grid-cols-4">
          {tech[lang].map((t) => (
            <RevealItem key={t.n}>
              <div className="grid min-h-44 gap-3 border border-line bg-white p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{t.n}</div>
                <h3 className="font-heading text-3xl font-semibold uppercase leading-none">{t.title}</h3>
                <p className="leading-6 text-ink-soft">{t.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>
    </>
  );
}
