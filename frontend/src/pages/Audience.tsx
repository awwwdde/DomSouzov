import { useSite } from '../context/SiteContext';
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
      <RevealSection className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · Зрителям' : 'Home · For Visitors'}</div>
          <h1 className="serif">{lang === 'ru' ? 'Зрителям' : 'For Visitors'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Всё, что нужно знать перед визитом: билеты, правила, возврат, доступная среда, дресс-код, фотосъёмка, дети.'
            : 'Everything you need before your visit: tickets, rules, refunds, accessibility, dress code, photography, children.'}
        </p>
      </RevealSection>

      <RevealList className="info-grid">
        {items[lang].map((item) => (
          <RevealItem key={item.n}>
            <div className="cell">
              <div className="num mono">{item.n}</div>
              <h3 className="serif">{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </RevealItem>
        ))}
      </RevealList>

      <RevealSection className="block">
        <h2>{lang === 'ru' ? 'Частые вопросы' : 'FAQ'}</h2>
        <RevealList className="timeline">
          {faq[lang].map((f) => (
            <RevealItem key={f.n}>
              <div className="tl-row">
                <div className="yr serif">{f.n}</div>
                <div className="ev">{f.q}</div>
                <div className="dc">{f.a}</div>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>
    </>
  );
}
