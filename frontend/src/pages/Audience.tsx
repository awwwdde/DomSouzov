import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

type RawItem = Record<string, unknown>;

const DEFAULT_ITEMS: RawItem[] = [
  { n: 'N° 01', title: { ru: 'Билеты', en: 'Tickets' }, desc: { ru: 'Онлайн на сайте, в кассе, через партнёрские сервисы. Электронные билеты принимаются со смартфона.', en: 'Online, at the box office, via partner services. E-tickets accepted from a smartphone.' } },
  { n: 'N° 02', title: { ru: 'Возврат', en: 'Refunds' }, desc: { ru: 'Возврат возможен не позднее чем за 24 часа до начала. Через форму возврата или в кассе.', en: 'Refunds available up to 24 hours before the event. Via the online form or box office.' } },
  { n: 'N° 03', title: { ru: 'Доступность', en: 'Accessibility' }, desc: { ru: 'Пандусы, лифт, специальные места, тактильные схемы, сопровождение по запросу.', en: 'Ramps, lift, wheelchair spaces, tactile plans, assisted access on request.' } },
  { n: 'N° 04', title: { ru: 'Дресс-код', en: 'Dress code' }, desc: { ru: 'Рекомендуется деловой или нарядный. На торжественных вечерах — вечерние наряды.', en: 'Smart attire recommended. Formal evenings: evening wear.' } },
  { n: 'N° 05', title: { ru: 'Фотосъёмка', en: 'Photography' }, desc: { ru: 'Без вспышки и штатива. Профессиональная съёмка — по согласованию.', en: 'No flash or tripod. Professional shoots by arrangement.' } },
  { n: 'N° 06', title: { ru: 'Дети', en: 'Children' }, desc: { ru: 'Возрастные ограничения указаны для каждого события. С 6 лет — отдельный билет.', en: 'Age ratings listed per event. From 6 years — separate ticket.' } },
  { n: 'N° 07', title: { ru: 'Гардероб', en: 'Cloakroom' }, desc: { ru: 'Работает за час до начала. Зонты и крупные сумки — обязательны к сдаче.', en: 'Opens one hour before the event. Umbrellas and large bags must be checked.' } },
  { n: 'N° 08', title: { ru: 'Кафе', en: 'Café' }, desc: { ru: 'В фойе — кафе с напитками и лёгким меню в антракте.', en: 'Foyer café with drinks and light menu at the interval.' } },
];

const DEFAULT_FAQ: RawItem[] = [
  { n: '01', q: { ru: 'Можно ли с ребёнком?', en: 'Can I bring children?' }, a: { ru: 'Зависит от возрастного ограничения события. С 6 лет — отдельный билет.', en: 'Depends on the age rating. From 6 years — separate ticket.' } },
  { n: '02', q: { ru: 'Что если опоздал?', en: "What if I'm late?" }, a: { ru: 'После начала — вход в паузу между номерами.', en: 'Entry only between pieces once the concert has begun.' } },
  { n: '03', q: { ru: 'Возврат билета?', en: 'Can I get a refund?' }, a: { ru: 'Не позднее 24 часов. Через форму на сайте.', en: 'Up to 24 hours in advance. Via the website form.' } },
];

export default function Audience() {
  const { lang, t, list, pickItem } = useSite();
  const title = t('audience_title') || (lang === 'ru' ? 'Зрителям' : 'For Visitors');
  const lead = t('audience_lead') || (lang === 'ru'
    ? 'Всё, что нужно знать перед визитом: билеты, правила, возврат, доступная среда, дресс-код, фотосъёмка, дети.'
    : 'Everything you need before your visit: tickets, rules, refunds, accessibility, dress code, photography, children.');
  const faqHeading = t('audience_faq_heading') || (lang === 'ru' ? 'Частые вопросы' : 'FAQ');

  const items = list<RawItem>('audience_items', DEFAULT_ITEMS);
  const faq = list<RawItem>('audience_faq', DEFAULT_FAQ);

  return (
    <>
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Зрителям' : 'Home · For Visitors'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">{title}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">{lead}</p>
      </RevealSection>

      <RevealList className="grid border-t border-line px-5 pb-16 md:px-12">
        {items.map((item, i) => (
          <RevealItem key={`${pickItem(item, 'n') || i}`}>
            <div className="grid gap-4 border-b border-line py-6 last:border-b-0 md:grid-cols-[100px_1fr_2fr] md:py-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{pickItem(item, 'n')}</div>
              <h3 className="font-heading text-[clamp(26px,3vw,40px)] font-bold uppercase leading-[1] tracking-[0.04em]">{pickItem(item, 'title')}</h3>
              <p className="leading-7 text-ink-soft">{pickItem(item, 'desc')}</p>
            </div>
          </RevealItem>
        ))}
      </RevealList>

      <RevealSection className="border-t border-line px-5 py-16 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">{faqHeading}</h2>
        <RevealList className="grid">
          {faq.map((f, i) => (
            <RevealItem key={`${pickItem(f, 'n') || i}`}>
              <div className="grid gap-4 border-t border-line py-5 md:grid-cols-[120px_1fr_2fr]">
                <div className="font-heading text-5xl font-semibold leading-none">{pickItem(f, 'n')}</div>
                <div className="font-semibold">{pickItem(f, 'q')}</div>
                <div className="leading-7 text-ink-soft">{pickItem(f, 'a')}</div>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>
    </>
  );
}
