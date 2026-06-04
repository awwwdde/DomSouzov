import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

type RawItem = Record<string, unknown>;

const DEFAULT_SERVICES_RU: RawItem[] = [
  { num: 'N° 01', title: { ru: 'Аренда Колонного зала', en: 'Hall of Columns hire' }, desc: { ru: 'флагманская площадка на 1026 мест. Пространство включает входную группу, гардероб, просторные фойе, буфетную зону, артистические и служебные помещения. Дополнительно доступен Овальный зал, который может использоваться для размещения президиума или VIP-гостей, а также для проведения параллельных активностей.', en: '1,200 seats. Corinthian columns. Five crystal chandeliers. Orchestra stage.' } },
  { num: 'N° 02', title: { ru: 'Октябрьский зал', en: 'October Hall' }, desc: { ru: '480 мест. Камерные концерты, лекции, пресс-конференции, приёмы.', en: '480 seats. Chamber concerts, lectures, press conferences, receptions.' } },
  { num: 'N° 03', title: { ru: 'Съёмки и сессии', en: 'Filming & sessions' }, desc: { ru: 'Историческая фактура: мрамор, хрусталь, лепнина. По согласованию графика.', en: 'Historical textures: marble, crystal, stucco. Subject to schedule.' } },
];

const DEFAULT_STEPS: RawItem[] = [
  { n: '01', ev: { ru: 'Запрос', en: 'Enquiry' }, dc: { ru: 'Форма на сайте или письмо. Указываются дата, формат, количество гостей.', en: 'Website form or email. Date, format, and guest count.' } },
  { n: '02', ev: { ru: 'Просмотр', en: 'Site visit' }, dc: { ru: 'Очный осмотр зала, обсуждение технических требований и сцены.', en: 'On-site walk-through, technical requirements and stage plan.' } },
  { n: '03', ev: { ru: 'Договор', en: 'Agreement' }, dc: { ru: 'Согласование сметы, подписание договора, бронирование даты.', en: 'Cost estimate, contract, date held.' } },
  { n: '04', ev: { ru: 'Проведение', en: 'Event' }, dc: { ru: 'Сопровождение технической командой Дома. Поддержка в день мероприятия.', en: 'Full support from the House technical crew on the day.' } },
];

const DEFAULT_TECH: RawItem[] = [
  { n: '01', title: { ru: 'Звук', en: 'Sound' }, desc: { ru: 'Линейный массив L-Acoustics, студийная запись, мобильный пульт.', en: 'L-Acoustics line array, studio recording, mobile console.' } },
  { n: '02', title: { ru: 'Свет', en: 'Lighting' }, desc: { ru: 'Программируемый световой комплекс, архитектурная подсветка.', en: 'Programmable lighting rig, architectural uplight.' } },
  { n: '03', title: { ru: 'Видео', en: 'Video' }, desc: { ru: 'LED-экран 8×4 м, четыре PTZ-камеры, прямая трансляция.', en: 'LED wall 8×4 m, four PTZ cameras, live streaming.' } },
  { n: '04', title: { ru: 'Сцена', en: 'Stage' }, desc: { ru: 'Концертный рояль Steinway D, оркестровые пюпитры, подиум.', en: 'Steinway D concert grand, orchestral stands, podium.' } },
];

export default function Organizers() {
  const { lang, t, list, pickItem } = useSite();
  const title = t('organizers_title') || (lang === 'ru' ? 'Организаторам' : 'For Organizers');
  const lead = t('organizers_lead') || (lang === 'ru'
    ? 'Аренда залов Дома Союзов для концертов, конференций, торжественных мероприятий и съёмок. Коринфская архитектура, акустика класса A, вместимость до 1 200 человек.'
    : 'Hire the halls of the House of Unions for concerts, conferences, ceremonies and filming. Corinthian architecture, class A acoustics, capacity up to 1,200.');
  const stepsHeading = t('organizers_steps_heading') || (lang === 'ru' ? 'Процесс бронирования' : 'Booking process');
  const techHeading = t('organizers_tech_heading') || (lang === 'ru' ? 'Техническое оснащение' : 'Technical equipment');

  const services = list<RawItem>('organizers_services', DEFAULT_SERVICES_RU);
  const steps = list<RawItem>('organizers_steps', DEFAULT_STEPS);
  const tech = list<RawItem>('organizers_tech', DEFAULT_TECH);

  return (
    <>
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Организаторам' : 'Home · For Organizers'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">{title}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">{lead}</p>
      </RevealSection>

      <RevealList className="grid border-t border-line px-5 pb-16 md:px-12">
        {services.map((s, i) => (
          <RevealItem key={`${pickItem(s, 'num') || i}`}>
            <div className="grid gap-4 border-b border-line py-6 last:border-b-0 md:grid-cols-[100px_1fr_2fr] md:py-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{pickItem(s, 'num')}</div>
              <h3 className="font-heading text-[clamp(28px,4vw,52px)] font-bold uppercase leading-[1] tracking-[0.04em]">{pickItem(s, 'title')}</h3>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <p className="leading-7 text-ink-soft">{pickItem(s, 'desc')}</p>
                <Link to="/contacts" className="shrink-0 text-xs font-bold uppercase tracking-[0.12em]">{lang === 'ru' ? 'Запрос' : 'Enquire'} →</Link>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealList>

      <RevealSection className="border-t border-line px-5 py-16 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">{stepsHeading}</h2>
        <RevealList className="grid">
          {steps.map((s, i) => (
            <RevealItem key={`${pickItem(s, 'n') || i}`}>
              <div className="grid gap-4 border-t border-line py-5 md:grid-cols-[120px_1fr_2fr]">
                <div className="font-heading text-5xl font-semibold leading-none">{pickItem(s, 'n')}</div>
                <div className="font-semibold">{pickItem(s, 'ev')}</div>
                <div className="leading-7 text-ink-soft">{pickItem(s, 'dc')}</div>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>

      <RevealSection className="border-t border-line px-5 py-16 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">{techHeading}</h2>
        <RevealList className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tech.map((it, i) => (
            <RevealItem key={`${pickItem(it, 'n') || i}`}>
              <div className="grid min-h-40 gap-3 border border-line bg-paper-soft p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{pickItem(it, 'n')}</div>
                <h3 className="font-heading text-2xl font-bold uppercase leading-none tracking-[0.04em]">{pickItem(it, 'title')}</h3>
                <p className="leading-6 text-ink-soft">{pickItem(it, 'desc')}</p>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>
    </>
  );
}
