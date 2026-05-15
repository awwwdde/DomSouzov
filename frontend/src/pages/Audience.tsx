import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

export default function Audience() {
  const { lang } = useSite();

  const items = {
    ru: [
      { n: 'N° 01', title: 'Билеты', desc: 'Онлайн на сайте, в кассе, через партнёрские сервисы. Электронные билеты принимаются со смартфона.' },
      { n: 'N° 02', title: 'Возврат', desc: 'Возврат возможен не позднее чем за 24 часа до начала. Через форму возврата или в кассе.' },
      { n: 'N° 03', title: 'Доступность', desc: 'Пандусы, лифт, специальные места, тактильные схемы, сопровождение по запросу.' },
      { n: 'N° 04', title: 'Дресс-код', desc: 'Рекомендуется деловой или нарядный. На торжественных вечерах — вечерние наряды.' },
      { n: 'N° 05', title: 'Фотосъёмка', desc: 'Без вспышки и штатива. Профессиональная съёмка — по согласованию.' },
      { n: 'N° 06', title: 'Дети', desc: 'Возрастные ограничения указаны для каждого события. С 6 лет — отдельный билет.' },
      { n: 'N° 07', title: 'Гардероб', desc: 'Работает за час до начала. Зонты и крупные сумки — обязательны к сдаче.' },
      { n: 'N° 08', title: 'Кафе', desc: 'В фойе — кафе с напитками и лёгким меню в антракте.' },
    ],
    en: [
      { n: 'N° 01', title: 'Tickets', desc: 'Online, at the box office, via partner services. E-tickets accepted from a smartphone.' },
      { n: 'N° 02', title: 'Refunds', desc: 'Refunds available up to 24 hours before the event. Via the online form or box office.' },
      { n: 'N° 03', title: 'Accessibility', desc: 'Ramps, lift, wheelchair spaces, tactile plans, assisted access on request.' },
      { n: 'N° 04', title: 'Dress code', desc: 'Smart attire recommended. Formal evenings: evening wear.' },
      { n: 'N° 05', title: 'Photography', desc: 'No flash or tripod. Professional shoots by arrangement.' },
      { n: 'N° 06', title: 'Children', desc: 'Age ratings listed per event. From 6 years — separate ticket.' },
      { n: 'N° 07', title: 'Cloakroom', desc: 'Opens one hour before the event. Umbrellas and large bags must be checked.' },
      { n: 'N° 08', title: 'Café', desc: 'Foyer café with drinks and light menu at the interval.' },
    ],
  };

  const faq = {
    ru: [
      { n: '01', q: 'Можно ли с ребёнком?', a: 'Зависит от возрастного ограничения события. С 6 лет — отдельный билет.' },
      { n: '02', q: 'Что если опоздал?', a: 'После начала — вход в паузу между номерами.' },
      { n: '03', q: 'Возврат билета?', a: 'Не позднее 24 часов. Через форму на сайте.' },
    ],
    en: [
      { n: '01', q: 'Can I bring children?', a: 'Depends on the age rating. From 6 years — separate ticket.' },
      { n: '02', q: "What if I'm late?", a: 'Entry only between pieces once the concert has begun.' },
      { n: '03', q: 'Can I get a refund?', a: 'Up to 24 hours in advance. Via the website form.' },
    ],
  };

  return (
    <>
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Зрителям' : 'Home · For Visitors'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">{lang === 'ru' ? 'Зрителям' : 'For Visitors'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Всё, что нужно знать перед визитом: билеты, правила, возврат, доступная среда, дресс-код, фотосъёмка, дети.'
            : 'Everything you need before your visit: tickets, rules, refunds, accessibility, dress code, photography, children.'}
        </p>
      </RevealSection>

      <RevealList className="grid border-t border-line px-5 pb-16 md:px-12">
        {items[lang].map((item) => (
          <RevealItem key={item.n}>
            <div className="grid gap-4 border-b border-line py-6 last:border-b-0 md:grid-cols-[100px_1fr_2fr] md:py-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{item.n}</div>
              <h3 className="font-heading text-[clamp(26px,3vw,40px)] font-bold uppercase leading-[1] tracking-[0.04em]">{item.title}</h3>
              <p className="leading-7 text-ink-soft">{item.desc}</p>
            </div>
          </RevealItem>
        ))}
      </RevealList>

      <RevealSection className="border-t border-line px-5 py-16 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">{lang === 'ru' ? 'Частые вопросы' : 'FAQ'}</h2>
        <RevealList className="grid">
          {faq[lang].map((f) => (
            <RevealItem key={f.n}>
              <div className="grid gap-4 border-t border-line py-5 md:grid-cols-[120px_1fr_2fr]">
                <div className="font-heading text-5xl font-semibold leading-none">{f.n}</div>
                <div className="font-semibold">{f.q}</div>
                <div className="leading-7 text-ink-soft">{f.a}</div>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>
    </>
  );
}
