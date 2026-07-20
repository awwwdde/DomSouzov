import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';
import { getLucideIcon } from '../lib/lucideIcons';

/* ============================================================ */
/* ЗРИТЕЛЯМ — официальные правила посещения Дома Союзов.        */
/* Карточки «Коротко о главном» редактируются из админки        */
/* (ключ `audience_items`): заголовок, описание и иконка Lucide. */
/* Полный текст правил — в раскрывающихся секциях ниже.          */
/* ============================================================ */

/** Один элемент списка правил, как его сохраняет ListEditor в админке. */
type RawRule = {
  icon?: string;
  title?: { ru?: string; en?: string } | string;
  desc?: { ru?: string; en?: string } | string;
};

/** Дефолтные карточки (если в админке ничего не задано). */
const DEFAULT_RULES: RawRule[] = [
  {
    icon: 'Accessibility',
    title: { ru: 'Доступная среда', en: 'Accessible environment' },
    desc: {
      ru: 'Залы Дома Союзов оснащены пандусами и приспособлены для маломобильных и малоподвижных граждан. Допускаются собаки-поводыри.',
      en: 'The halls are equipped with ramps and adapted for visitors with limited mobility. Guide dogs are welcome.',
    },
  },
  {
    icon: 'Ban',
    title: { ru: 'Запрещённые предметы', en: 'Prohibited items' },
    desc: {
      ru: 'Нельзя проносить оружие, опасные и пахучие вещества, колющие и режущие предметы, пиротехнику, лазерные фонарики, алкоголь, еду, чемоданы и крупные сумки.',
      en: 'No weapons, hazardous or odorous substances, sharp objects, pyrotechnics, laser pointers, alcohol, food, suitcases or large bags.',
    },
  },
  {
    icon: 'Shirt',
    title: { ru: 'Верхняя одежда — в гардероб', en: 'Outerwear to the cloakroom' },
    desc: {
      ru: 'В залы нельзя входить в верхней одежде и проносить её с собой. Крупные сумки, рюкзаки, пакеты и коляски в гардероб не принимаются.',
      en: 'Outerwear is not allowed in the halls. Large bags, backpacks and strollers are not accepted in the cloakroom.',
    },
  },
  {
    icon: 'CupSoda',
    title: { ru: 'Еда и напитки', en: 'Food and drinks' },
    desc: {
      ru: 'Проносить и употреблять еду и напитки в залах запрещено — исключение только бутилированная вода без газа.',
      en: 'Food and drinks are not allowed in the halls — the only exception is still bottled water.',
    },
  },
  {
    icon: 'CigaretteOff',
    title: { ru: 'Курение запрещено', en: 'No smoking' },
    desc: {
      ru: 'Курение табака, электронных сигарет и иной никотиносодержащей продукции в помещениях Дома Союзов запрещено (ФЗ № 15-ФЗ).',
      en: 'Smoking of tobacco, e-cigarettes and other nicotine products is prohibited indoors (Federal Law No. 15-FZ).',
    },
  },
  {
    icon: 'Baby',
    title: { ru: 'Дети до 14 лет', en: 'Children under 14' },
    desc: {
      ru: 'Посетители до 14 лет допускаются только в сопровождении совершеннолетних. Для групп — не менее одного сопровождающего на 10 детей.',
      en: 'Visitors under 14 are admitted only when accompanied by adults. For groups — at least one adult per 10 children.',
    },
  },
  {
    icon: 'Dog',
    title: { ru: 'С животными нельзя', en: 'No animals' },
    desc: {
      ru: 'Вход с животными запрещён. Исключение — собаки-поводыри для лиц с ограниченными возможностями.',
      en: 'Entry with animals is prohibited. The exception is guide dogs for people with disabilities.',
    },
  },
  {
    icon: 'AlertTriangle',
    title: { ru: 'Бесхозные вещи', en: 'Unattended items' },
    desc: {
      ru: 'Обнаружив оставленные без присмотра предметы, немедленно сообщите сотрудникам охраны. Трогать и перемещать их строго запрещается.',
      en: 'If you notice unattended items, inform security immediately. Touching or moving them is strictly forbidden.',
    },
  },
];

type Bi = { ru: string; en: string };
type RuleSection = { heading: Bi; items: { n: string; text: Bi }[]; note?: Bi };

const SECTIONS: RuleSection[] = [
  {
    heading: { ru: '1. Общие положения', en: '1. General provisions' },
    items: [
      {
        n: '1.1',
        text: {
          ru: 'Настоящие правила разработаны в соответствии с уставом федерального государственного бюджетного учреждения «Управление по эксплуатации зданий Федерального Собрания Российской Федерации» Управления делами Президента Российской Федерации (далее — Учреждение), действующим законодательством Российской Федерации и устанавливают порядок посещения здания Дома Союзов (объект культурного наследия федерального значения «Дом Благородного собрания с колонным залом, 1780-е гг., арх. М.Ф. Казаков»), расположенного по адресу: г. Москва, вн.тер.г, муниципальный округ Тверской, ул. Дмитровка Б., д. 1 (далее — Дом Союзов), при проведении мероприятий, выставок, экскурсий и др. (далее — Правила).',
          en: 'These rules have been developed in accordance with the charter of the Federal State Budgetary Institution “Directorate for the Operation of Buildings of the Federal Assembly of the Russian Federation” of the Administration of the President of the Russian Federation (hereinafter — the Institution), the current legislation of the Russian Federation, and establish the procedure for visiting the building of the House of Unions (a cultural heritage site of federal significance “House of the Noble Assembly with the Hall of Columns, 1780s, arch. M.F. Kazakov”), located at: Moscow, Tverskoy municipal district, Bolshaya Dmitrovka St., 1 (hereinafter — the House of Unions), during events, exhibitions, excursions, etc. (hereinafter — the Rules).',
        },
      },
      {
        n: '1.2',
        text: {
          ru: 'Настоящие Правила публикуются на официальном сайте Дома Союзов.',
          en: 'These Rules are published on the official website of the House of Unions.',
        },
      },
    ],
  },
  {
    heading: { ru: '2. Правила прохода в здание', en: '2. Rules of entry into the building' },
    items: [
      {
        n: '2.1',
        text: {
          ru: 'Запрещается проходить в здание с оружием, огнеопасными, взрывчатыми, ядовитыми, пахучими и радиоактивными веществами, колющими и режущими предметами, пиротехническими устройствами, лазерными фонариками, наркотическими веществами, алкогольными напитками, пищей, чемоданами, крупными свёртками и сумками, в пачкающей одежде или с предметами, которые могут испачкать других посетителей, мебель и иное имущество, расположенное в здании Дома Союзов.',
          en: 'It is prohibited to enter the building with weapons; flammable, explosive, poisonous, odorous and radioactive substances; sharp and cutting objects; pyrotechnic devices; laser pointers; narcotic substances; alcoholic beverages; food; suitcases; large parcels and bags; in soiling clothing or with items that may soil other visitors, furniture and other property located in the building of the House of Unions.',
        },
      },
      {
        n: '2.2',
        text: {
          ru: 'С целью обеспечения безопасности контроль посетителей и находящихся при них вещей осуществляется как визуально, так и с применением металлодетекторов и иных специальных приборов и устройств.',
          en: 'To ensure security, the screening of visitors and the items they carry is carried out both visually and using metal detectors and other special devices and equipment.',
        },
      },
      {
        n: '2.3',
        text: {
          ru: 'В случае отказа пройти досмотр, посетитель не допускается в здание.',
          en: 'If a visitor refuses to undergo screening, they are not admitted to the building.',
        },
      },
      {
        n: '2.4',
        text: {
          ru: 'После прохождения посетителем досмотра осуществляется проверка основания прохода на мероприятие, выставку, экскурсию (билет, приглашение, список, заявка).',
          en: 'After the visitor has passed screening, the grounds for entry to the event, exhibition or excursion are checked (ticket, invitation, list, application).',
        },
      },
      {
        n: '2.5',
        text: {
          ru: 'Вход в здание Дома Союзов с животными запрещён, за исключением случаев посещения мероприятий, выставок, экскурсий лицами с ограниченными возможностями, для которых животное является поводырём и необходимым условием передвижения.',
          en: 'Entry into the building of the House of Unions with animals is prohibited, except where persons with disabilities visit events, exhibitions or excursions and the animal is a guide and a necessary condition for their movement.',
        },
      },
      {
        n: '2.6',
        text: {
          ru: 'Посетители возраста до 14 лет допускаются в здание Дома Союзов только в сопровождении совершеннолетних сопровождающих.',
          en: 'Visitors under the age of 14 are admitted to the building of the House of Unions only when accompanied by adult companions.',
        },
      },
      {
        n: '2.7',
        text: {
          ru: 'При посещении мероприятий, выставок, экскурсий группой посетителей несовершеннолетнего возраста обязательно присутствие сопровождающего лица старше 18 лет, из расчёта не менее одного сопровождающего на 10 несовершеннолетних посетителей. Руководитель группы или сопровождающие родители принимают на себя ответственность за жизнь и здоровье, а также за поведение сопровождаемых детей на протяжении всего пребывания в здании Дома Союзов.',
          en: 'When a group of underage visitors attends events, exhibitions or excursions, the presence of an accompanying person over 18 years of age is mandatory, at a rate of at least one companion per 10 underage visitors. The group leader or accompanying parents assume responsibility for the life, health and behaviour of the accompanied children throughout their stay in the building of the House of Unions.',
        },
      },
      {
        n: '2.8',
        text: {
          ru: 'Учреждение не несёт ответственность за задержку при проходе в здание Дома Союзов в связи с осуществлением досмотра сотрудниками охраны.',
          en: 'The Institution is not responsible for delays in entering the building of the House of Unions due to screening by security staff.',
        },
      },
    ],
  },
  {
    heading: { ru: '3. Правила нахождения в залах и помещениях', en: '3. Rules of conduct in the halls and premises' },
    items: [
      {
        n: '3.1',
        text: {
          ru: 'Запрещается входить в залы и помещения Дома Союзов в верхней одежде, а также проносить её с собой, размещать на зрительских креслах.',
          en: 'It is prohibited to enter the halls and premises of the House of Unions in outerwear, or to carry it with you or place it on the audience seats.',
        },
      },
      {
        n: '3.2',
        text: {
          ru: 'В гардеробе Дома Союзов не принимаются на хранение сумки большого размера, рюкзаки, пакеты, коляски и т.п.',
          en: 'Large bags, backpacks, packages, strollers, etc. are not accepted for storage in the cloakroom of the House of Unions.',
        },
      },
      {
        n: '3.3',
        text: {
          ru: 'В случае утери жетона (номерка) или утраты личных вещей из гардероба, посетитель должен обратиться к работнику гардероба или представителям администрации Дома Союзов.',
          en: 'In case of loss of the token (tag) or loss of personal belongings from the cloakroom, the visitor must contact the cloakroom attendant or representatives of the House of Unions administration.',
        },
      },
      {
        n: '3.4',
        text: {
          ru: 'Учреждение не несёт ответственности, в том числе материальной, за сохранность личного имущества посетителей.',
          en: 'The Institution is not liable, including financially, for the safety of visitors’ personal property.',
        },
      },
      {
        n: '3.5',
        text: {
          ru: 'При посещении мероприятий, выставок, экскурсий в Доме Союзов посетителям необходимо: бережно относиться к имуществу и оборудованию с учётом охранного статуса объекта, соблюдать общественный порядок, правила пожарной безопасности и меры предосторожности на ступенях лестниц; уважительно относиться к другим посетителям и работникам Дома Союзов, не допускать нарушения общепринятых норм поведения (нецензурной брани, агрессии, физического насилия, нарушения тишины и т.п.); выполнять требования сотрудников частного охранного предприятия, осуществляющих контроль общественного порядка и безопасного посещения.',
          en: 'When attending events, exhibitions or excursions at the House of Unions, visitors must: treat the property and equipment with care, taking into account the protected status of the site; observe public order, fire safety rules and precautions on the stairs; treat other visitors and staff of the House of Unions with respect, refraining from violating generally accepted norms of behaviour (obscene language, aggression, physical violence, breach of silence, etc.); and comply with the requirements of the private security company staff monitoring public order and safe visiting.',
        },
      },
      {
        n: '3.6',
        text: {
          ru: 'В залах и помещениях Дома Союзов посетителям запрещается: размещать между проходами зала стулья и громоздкие вещи, препятствующие эвакуации; проносить и употреблять пищу и напитки, за исключением бутилированной негазированной воды; курение табака, электронных сигарет, употребление иной никотиносодержащей продукции; выходить на сцену и за кулисы, в технические и служебные помещения, перемещать предметы интерьера; входить за установленные ограждения и в помещения, закрытые для посещения; сидеть и стоять в проходах между рядами и на ступенях лестниц; трогать и передвигать экспонаты, совершать любые неправомерные действия, нарушающие внешний вид и техническое состояние объектов.',
          en: 'In the halls and premises of the House of Unions, visitors are prohibited from: placing chairs and bulky items in the aisles that obstruct evacuation; bringing in and consuming food and drinks, except for still bottled water; smoking tobacco or e-cigarettes or using other nicotine products; going onto the stage and backstage, into technical and service areas, or moving interior items; entering beyond the established barriers and into areas closed to visitors; sitting and standing in the aisles between rows and on the stairs; touching and moving exhibits, or committing any unlawful actions that damage the appearance and technical condition of the objects.',
        },
      },
      {
        n: '3.7',
        text: {
          ru: 'В случае обнаружения оставленных без присмотра предметов или вещей необходимо немедленно сообщить об этом сотрудникам охраны / частного охранного предприятия / представителям администрации. Брать в руки, открывать, сдвигать с места данные предметы строго запрещается.',
          en: 'If unattended objects or items are found, security staff / the private security company / administration representatives must be notified immediately. It is strictly forbidden to pick up, open or move such items.',
        },
      },
      {
        n: '3.8',
        text: {
          ru: 'В случае ухудшения самочувствия или в иных нештатных ситуациях посетитель незамедлительно обращается к организатору мероприятия / сотрудникам охраны / представителям администрации Дома Союзов.',
          en: 'In case of feeling unwell or in other emergency situations, the visitor must immediately contact the event organiser / security staff / representatives of the House of Unions administration.',
        },
      },
      {
        n: '3.9',
        text: {
          ru: 'В случае возникновения форс-мажорных обстоятельств организуется эвакуация посетителей через основные пути эвакуации и запасные выходы согласно размещённым схемам.',
          en: 'In the event of force majeure, visitors are evacuated via the main evacuation routes and emergency exits according to the posted plans.',
        },
      },
      {
        n: '3.10',
        text: {
          ru: 'Посетители, нарушающие настоящие Правила и иные нормы общественного правопорядка, могут быть удалены из здания Дома Союзов.',
          en: 'Visitors who violate these Rules and other norms of public order may be removed from the building of the House of Unions.',
        },
      },
    ],
    note: {
      ru: 'Обращаем внимание: в соответствии с Федеральным законом от 23.02.2013 № 15-ФЗ «Об охране здоровья граждан от воздействия окружающего табачного дыма и последствий потребления табака» курение в помещениях Дома Союзов запрещено.',
      en: 'Please note: in accordance with Federal Law No. 15-FZ of 23 February 2013 “On Protecting the Health of Citizens from the Effects of Second-hand Tobacco Smoke and the Consequences of Tobacco Consumption”, smoking is prohibited indoors at the House of Unions.',
    },
  },
];

export default function Audience() {
  const { lang, tStrict, list, pickItem } = useSite();
  const title = tStrict('audience_title') || (lang === 'ru' ? 'Зрителям' : 'For Visitors');
  const rules = list<RawRule>('audience_items', DEFAULT_RULES);
  const lead =
    tStrict('audience_lead') ||
    (lang === 'ru'
      ? 'Правила посещения Дома Союзов: проход в здание, гардероб, поведение в залах. Главное — в карточках ниже, полный текст — в разделах.'
      : 'Rules of visiting the House of Unions: entry, cloakroom, conduct in the halls.');

  return (
    <div className="bg-paper">
      <Seo
        title={lang === 'ru' ? 'Зрителям — правила посещения · Дом Союзов' : 'For Visitors — House of Unions'}
        description={lead}
        path="audience"
        lang={lang}
      />

      {/* HERO */}
      <RevealSection className="border-b border-line px-5 pb-14 pt-28 md:px-12 md:pb-20 md:pt-32">
        <PageKicker>{lang === 'ru' ? 'Главная · Зрителям' : 'Home · For Visitors'}</PageKicker>
        <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
          {title}
        </h1>
      </RevealSection>

      {/* КОРОТКО О ГЛАВНОМ — карточки */}
      <RevealSection className="px-5 py-14 md:px-12 md:py-20">
        <h2 className="mb-10 font-heading text-[clamp(28px,4vw,56px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
          {lang === 'ru' ? 'Коротко о главном' : 'Key points'}
        </h2>
        <RevealList className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {rules.map((r, i) => {
            const Icon = getLucideIcon(typeof r.icon === 'string' ? r.icon : undefined);
            const ruleTitle = pickItem(r, 'title');
            const ruleText = pickItem(r, 'desc');
            return (
              <RevealItem key={`${ruleTitle}-${i}`}>
                <div className="group flex h-full flex-col gap-4 bg-paper p-7 transition hover:bg-paper-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-line text-accent transition group-hover:border-accent group-hover:bg-accent group-hover:text-paper">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                  <h3 className="font-heading text-[clamp(17px,1.4vw,21px)] font-bold uppercase leading-[1.1] tracking-[0.02em] text-ink">
                    {ruleTitle}
                  </h3>
                  <p className="text-justify text-[14px] leading-6 text-ink-soft [hyphens:none] [text-align-last:start]">
                    {ruleText}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </RevealList>
      </RevealSection>

      {/* ПОЛНЫЕ ПРАВИЛА — раскрывающиеся секции */}
      <RevealSection className="border-t border-line px-5 py-14 md:px-12 md:py-20">
        <h2 className="mb-3 font-heading text-[clamp(28px,4vw,56px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
          {lang === 'ru' ? 'Полные правила посещения' : 'Full visiting rules'}
        </h2>
        <p className="mb-10 w-full text-justify text-[16px] leading-[1.75] text-ink-soft [text-align-last:start]">
          {lang === 'ru'
            ? 'Официальные правила посещения здания Дома Союзов при проведении мероприятий, выставок и экскурсий.'
            : 'Official rules for visiting the House of Unions building during events, exhibitions and excursions.'}
        </p>

        <div className="mx-auto max-w-[1000px] divide-y divide-line border-y border-line">
          {SECTIONS.map((section, idx) => (
            <details key={section.heading.ru} className="group" open={idx === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 transition hover:text-accent">
                <span className="font-heading text-[clamp(20px,2.2vw,30px)] font-bold uppercase leading-[1.05] tracking-[0.02em] text-ink group-open:text-accent">
                  {section.heading[lang]}
                </span>
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink transition group-open:rotate-45 group-open:border-accent group-open:text-accent"
                >
                  +
                </span>
              </summary>
              <div className="pb-8">
                <ul className="space-y-5">
                  {section.items.map((item) => (
                    <li key={item.n} className="grid gap-2 md:grid-cols-[64px_1fr] md:gap-5">
                      <span className="font-mono text-[13px] font-bold tabular-nums text-accent">{item.n}</span>
                      <p className="text-justify text-[16px] leading-[1.75] text-ink-soft [text-align-last:start]">{item.text[lang]}</p>
                    </li>
                  ))}
                </ul>
                {section.note ? (
                  <div className="mt-6 border-l-2 border-accent bg-paper-soft px-5 py-4 text-[14px] leading-6 text-ink">
                    {section.note[lang]}
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </RevealSection>
    </div>
  );
}
