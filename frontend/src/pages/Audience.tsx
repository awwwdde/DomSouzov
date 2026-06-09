import {
  Ticket,
  Clock,
  Camera,
  Users,
  Shirt,
  Coffee,
  Accessibility,
  Volume2,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

type RawItem = Record<string, unknown>;

/* ============================================================ */
/* ЗРИТЕЛЯМ — правила нахождения в Доме Союзов.                 */
/* Карточки с иконками; контент редактируется в CMS через ключ  */
/* audience_items (массив { title, desc }).                      */
/* ============================================================ */

const DEFAULT_ITEMS: RawItem[] = [
  { title: { ru: 'Билеты', en: 'Tickets' }, desc: { ru: 'Электронный билет показывайте с экрана смартфона на входе. Сохраните его заранее — в фойе может не быть связи.', en: 'Show your e-ticket from your phone at the entrance. Save it in advance — signal in the foyer may be weak.' } },
  { title: { ru: 'Приходите заранее', en: 'Arrive early' }, desc: { ru: 'Двери открываются за час до начала. После третьего звонка вход в зал — только в антракте.', en: 'Doors open one hour before. After the final bell, entry is allowed only at the interval.' } },
  { title: { ru: 'Гардероб', en: 'Cloakroom' }, desc: { ru: 'Верхнюю одежду, зонты и крупные сумки необходимо сдать. Гардероб работает до окончания мероприятия.', en: 'Outerwear, umbrellas and large bags must be checked in. The cloakroom is open until the event ends.' } },
  { title: { ru: 'Тишина в зале', en: 'Silence in the hall' }, desc: { ru: 'Переведите телефон в беззвучный режим. Во время выступления просьба не разговаривать и не пользоваться экраном.', en: 'Switch your phone to silent. Please do not talk or use your screen during the performance.' } },
  { title: { ru: 'Фотосъёмка', en: 'Photography' }, desc: { ru: 'Любительская съёмка — без вспышки и штатива. Профессиональная съёмка — только по согласованию.', en: 'Amateur photography without flash or tripod. Professional shoots by prior arrangement only.' } },
  { title: { ru: 'Дресс-код', en: 'Dress code' }, desc: { ru: 'Рекомендуем деловой или нарядный стиль. На торжественных вечерах — вечерние наряды.', en: 'Smart or elegant attire is recommended. Formal evenings call for evening wear.' } },
  { title: { ru: 'Дети', en: 'Children' }, desc: { ru: 'Возрастные ограничения указаны для каждого мероприятия. С 6 лет ребёнку нужен отдельный билет.', en: 'Age ratings are listed per event. From age 6 a child needs a separate ticket.' } },
  { title: { ru: 'Еда и напитки', en: 'Food & drinks' }, desc: { ru: 'В фойе работает буфет. Проносить еду и напитки в зал не разрешается.', en: 'A buffet operates in the foyer. Food and drinks may not be taken into the hall.' } },
  { title: { ru: 'Доступная среда', en: 'Accessibility' }, desc: { ru: 'Пандусы, лифт, места для колясок и сопровождение по запросу. Сообщите о потребностях заранее.', en: 'Ramps, a lift, wheelchair spaces and assistance on request. Let us know your needs in advance.' } },
];

const ICONS: LucideIcon[] = [Ticket, Clock, ShoppingBag, Volume2, Camera, Shirt, Users, Coffee, Accessibility];

export default function Audience() {
  const { lang, tStrict, list, pickItem } = useSite();
  const title = tStrict('audience_title') || (lang === 'ru' ? 'Зрителям' : 'For Visitors');
  const lead =
    tStrict('audience_lead') ||
    (lang === 'ru'
      ? 'Несколько простых правил, чтобы вечер в Доме Союзов прошёл комфортно для вас и для всех гостей.'
      : 'A few simple rules so that your evening at the House of Unions is comfortable for you and for every guest.');

  const items = list<RawItem>('audience_items', DEFAULT_ITEMS);

  return (
    <div className="bg-paper">
      <Seo
        title={lang === 'ru' ? 'Зрителям — Дом Союзов' : 'For Visitors — House of Unions'}
        description={lead}
        path="audience"
        lang={lang}
      />
      {/* HERO */}
      <RevealSection className="grid gap-8 border-b border-line px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-20 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Зрителям' : 'Home · For Visitors'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {title}
          </h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">{lead}</p>
      </RevealSection>

      {/* ПРАВИЛА — карточки с иконками */}
      <RevealList className="grid grid-cols-1 gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <RevealItem key={`${pickItem(item, 'title') || i}`}>
              <div className="group flex h-full flex-col gap-5 bg-paper p-8 transition hover:bg-paper-soft md:p-10">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-line text-accent transition group-hover:border-accent group-hover:bg-accent group-hover:text-paper">
                  <Icon size={26} strokeWidth={1.5} />
                </span>
                <h3 className="font-heading text-[clamp(22px,2vw,30px)] font-bold uppercase leading-[1.05] tracking-[0.02em] text-ink">
                  {pickItem(item, 'title')}
                </h3>
                <p className="text-[15px] leading-7 text-ink-soft">{pickItem(item, 'desc')}</p>
              </div>
            </RevealItem>
          );
        })}
      </RevealList>
    </div>
  );
}
