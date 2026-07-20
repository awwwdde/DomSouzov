import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import { useReducedMotionActive } from '../lib/motion';
import { revokeConsent } from '../lib/consent';
import { usePhones, telHref } from '../lib/phones';

/* ============================================================ */
/* FOOTER — четырёхколоночная подвал-сетка в духе ZILART.       */
/*  Ряд 1: логотип-вход.                                        */
/*  Ряд 2: 4 колонки разделов + ссылки-плитки.                  */
/*  Ряд 3: адрес, телефон, e-mail, соц-сети.                     */
/*  Ряд 4: copyright + правовые ссылки, настройки cookie.        */
/*                                                              */
/*  Всё содержимое редактируется в админке (Настройки → Подвал).*/
/*  Константы ниже — фолбэк: показываются, пока соответствующая  */
/*  настройка пуста, поэтому подвал никогда не «схлопывается».   */
/* ============================================================ */

/** Пункт навигации: `column` — заголовок колонки, в которую он попадёт.
 *  Плоский список (а не вложенный) — так его умеет редактировать
 *  ListEditor в админке; колонки собираются группировкой по `column`. */
type RawNavItem = { column?: unknown; label?: unknown; link?: unknown };
type RawTile = { label?: unknown; link?: unknown };
type RawSocial = { label?: unknown; url?: unknown };

const DEFAULT_NAV: Array<{ column: { ru: string; en: string }; label: { ru: string; en: string }; link: string }> = [
  { column: { ru: 'Афиша', en: 'Programme' }, label: { ru: 'Афиша', en: 'Programme' }, link: '/events' },
  { column: { ru: 'Афиша', en: 'Programme' }, label: { ru: 'Новости', en: 'News' }, link: '/news' },
  { column: { ru: 'Афиша', en: 'Programme' }, label: { ru: 'Галерея', en: 'Gallery' }, link: '/gallery' },
  { column: { ru: 'Дом', en: 'House' }, label: { ru: 'Залы', en: 'Halls' }, link: '/halls' },
  { column: { ru: 'Дом', en: 'House' }, label: { ru: 'О Доме', en: 'About' }, link: '/about' },
  { column: { ru: 'Гостям', en: 'Guests' }, label: { ru: 'Организаторам', en: 'For organizers' }, link: '/organizers' },
  { column: { ru: 'Гостям', en: 'Guests' }, label: { ru: 'Зрителям', en: 'For visitors' }, link: '/audience' },
  { column: { ru: 'Информация', en: 'Information' }, label: { ru: 'Контакты', en: 'Contacts' }, link: '/contacts' },
];

const DEFAULT_TILES = [
  { label: { ru: 'Афиша', en: 'Programme' }, link: '/events' },
  { label: { ru: 'Залы', en: 'Halls' }, link: '/halls' },
  { label: { ru: 'Организаторам', en: 'For organizers' }, link: '/organizers' },
  { label: { ru: 'Контакты', en: 'Contacts' }, link: '/contacts' },
];

/** Внутренние пути рендерим через <Link> (SPA-переход), внешние — <a>. */
function isExternal(href: string) {
  return /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

function NavLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  if (isExternal(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to || '/'} className={className}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const { lang, t, list, pickItem } = useSite();
  const reduced = useReducedMotionActive();
  const year = new Date().getFullYear();
  const phones = usePhones();

  const ru = lang === 'ru';

  /* Навигация: плоский список из админки → колонки в порядке появления. */
  const navItems = list<RawNavItem>('footer_nav', DEFAULT_NAV);
  const columns: Array<{ title: string; items: Array<{ label: string; link: string }> }> = [];
  navItems.forEach((item) => {
    const title = pickItem(item, 'column');
    const label = pickItem(item, 'label');
    const link = pickItem(item, 'link');
    if (!label) return;
    const col = columns.find((c) => c.title === title);
    if (col) col.items.push({ label, link });
    else columns.push({ title, items: [{ label, link }] });
  });

  const tiles = list<RawTile>('footer_tiles', DEFAULT_TILES)
    .map((tile) => ({ label: pickItem(tile, 'label'), link: pickItem(tile, 'link') }))
    .filter((tile) => tile.label);

  /* Соцсети: сначала произвольный список из админки, иначе — три
     исторических ключа social_vk / social_max / social_tg.
     Показываем только заполненные — без «мёртвых» href="#". */
  const customSocials = list<RawSocial>('footer_socials', [])
    .map((s) => ({ label: pickItem(s, 'label'), href: pickItem(s, 'url') }))
    .filter((s) => s.label && s.href);
  const legacySocials = (
    [
      { label: 'ВКонтакте', href: t('social_vk') },
      { label: 'MAX', href: t('social_max') },
      { label: 'Telegram', href: t('social_tg') },
    ] as const
  ).filter((s) => s.href && s.href.trim().length > 0);
  const socials = customSocials.length > 0 ? customSocials : legacySocials;

  const brandTitle = t('footer_brand_title') || (ru ? 'Дом Союзов' : 'House of Unions');

  // Логотип УДП внизу подвала: сам файл, подпись и необязательная ссылка.
  const udpLogo = t('footer_udp_logo');
  const udpAlt = t('footer_udp_caption');
  const udpUrl = t('footer_udp_url');

  return (
    <footer className="border-t border-white/10 bg-ink text-paper">
      <div className="mx-auto w-full max-w-[1800px] px-5 pb-10 pt-16 md:w-[95%] md:px-6 md:pb-14 md:pt-24">
        {/* Большой логотип-вход */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 border-b border-paper/10 pb-10 md:grid-cols-12 md:gap-10 md:pb-14"
        >
          <Link to="/" className="md:col-span-12 group flex items-end gap-6" aria-label={brandTitle}>
            <img
              src={t('footer_logo') || '/logo-house.svg'}
              alt=""
              className="h-20 w-auto md:h-28"
              style={{ filter: 'invert(1) brightness(1.1)' }}
            />
            <div className="flex flex-col gap-3">
              <span className="font-heading text-[clamp(36px,6vw,72px)] font-bold uppercase leading-[0.92] tracking-[0.02em]">
                {brandTitle}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-paper/55">
                {t('footer_brand_subtitle') || (ru ? 'Большая Дмитровка, дом 1' : 'Bolshaya Dmitrovka 1')}
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Колонки навигации */}
        {columns.length > 0 ? (
          <div className="grid gap-10 border-b border-paper/10 py-10 md:grid-cols-4 md:gap-10 md:py-14">
            {columns.map((col) => (
              <FooterColumn key={col.title} title={col.title} items={col.items} />
            ))}
          </div>
        ) : null}

        {/* Плитки-разделы */}
        {tiles.length > 0 ? (
          <div className="grid gap-2 border-b border-paper/10 py-8 md:grid-cols-4 md:gap-3">
            {tiles.map((tile) => (
              <NavLink
                key={tile.link + tile.label}
                to={tile.link}
                className="group flex items-center justify-between border-b border-paper/10 py-3 font-heading text-[clamp(20px,1.6vw,26px)] font-bold uppercase leading-none tracking-[0.04em] text-paper transition md:border-b-0 md:border-l md:border-paper/15 md:px-5 md:py-4 first:md:border-l-0"
              >
                <span className="relative inline-block after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">
                  {tile.label}
                </span>
                <span aria-hidden className="text-paper/40 transition group-hover:translate-x-1 group-hover:text-paper">
                  →
                </span>
              </NavLink>
            ))}
          </div>
        ) : null}

        {/* Контакты + соц-сети */}
        <div className="grid gap-10 border-b border-paper/10 py-10 md:grid-cols-12 md:gap-10 md:py-12">
          <div className="md:col-span-5 space-y-2 text-[13px] leading-relaxed">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/55">
              {t('footer_heading_address') || (ru ? 'Адрес' : 'Address')}
            </div>
            <address className="not-italic text-paper/85">
              {t('address_ru') || (ru ? 'Большая Дмитровка, дом 1, Москва' : 'Bolshaya Dmitrovka 1, Moscow')}
            </address>
            <p className="text-paper/55">
              {t('metro_ru') ||
                (ru ? 'Ст. метро «Охотный Ряд», «Театральная»' : 'Okhotny Ryad, Teatralnaya metro stations')}
            </p>
          </div>
          <div className="md:col-span-4 space-y-2 text-[13px] leading-relaxed">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/55">
              {t('footer_heading_contact') || (ru ? 'Связь' : 'Contact')}
            </div>
            {phones.map((p) => (
              <a
                key={p.number}
                className="block font-mono text-[15px] font-medium text-paper transition hover:underline hover:underline-offset-4"
                href={telHref(p.number)}
              >
                {p.number}
                {p.label ? <span className="ml-2 font-sans text-[12px] text-paper/55">{p.label}</span> : null}
              </a>
            ))}
            {t('email_press') || t('contact_email') ? (
              <a
                className="block text-paper/85 transition hover:underline hover:underline-offset-4"
                href={`mailto:${t('contact_email') || t('email_press')}`}
              >
                {t('contact_email') || t('email_press')}
              </a>
            ) : null}
            <p className="text-paper/55">
              {ru ? t('hours_ru') || 'Вход: пн–вс 11:00–20:00' : t('hours_en') || 'Entrance: Mon–Sun 11:00–20:00'}
            </p>
          </div>
          <div className="md:col-span-3 space-y-2 text-[13px] leading-relaxed">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/55">
              {t('footer_heading_social') || (ru ? 'Соцсети' : 'Social')}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.18em]">
              {socials.length > 0 ? (
                socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-paper/30 pb-px text-paper transition hover:border-accent hover:text-accent"
                  >
                    {s.label}
                  </a>
                ))
              ) : (
                <span className="text-paper/45">{ru ? 'Скоро' : 'Soon'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Нижний ряд: слева реквизиты, по центру логотип УДП, справа правовые
            ссылки. Когда логотип не загружен, левый и правый блоки делят ряд
            пополам — как было до его появления. */}
        <div className="grid gap-6 pt-8 text-[11px] leading-relaxed text-paper/45 md:grid-cols-12 md:items-center">
          <div className={`${udpLogo ? 'md:col-span-4' : 'md:col-span-6'} space-y-1`}>
            <div>
              © {year} {t('footer_copyright_name') || brandTitle}
            </div>
            {t('legal_full_name') ? <div>{t('legal_full_name')}</div> : null}
            <div className="flex flex-wrap gap-x-4">
              {t('legal_inn') ? <span>ИНН {t('legal_inn')}</span> : null}
              {t('legal_ogrn') ? <span>{ru ? 'ОГРН' : 'OGRN'} {t('legal_ogrn')}</span> : null}
              {t('legal_kpp') ? <span>КПП {t('legal_kpp')}</span> : null}
            </div>
            {t('legal_address') ? <div>{t('legal_address')}</div> : null}
          </div>
          {/* Логотип Управления делами Президента РФ — центральная колонка
              нижнего ряда. Выводится, только если загружен в админке
              (Настройки → Подвал). */}
          {udpLogo ? (
            <div className="md:col-span-4 flex flex-col items-center gap-2 md:order-none">
              {udpUrl ? (
                <a href={udpUrl} target="_blank" rel="noopener noreferrer" className="transition hover:opacity-80">
                  <img src={udpLogo} alt={udpAlt} className="h-12 w-auto md:h-14" />
                </a>
              ) : (
                <img src={udpLogo} alt={udpAlt} className="h-12 w-auto md:h-14" />
              )}
              {udpAlt ? (
                <span className="max-w-[280px] text-center text-[10px] leading-snug text-paper/45">{udpAlt}</span>
              ) : null}
            </div>
          ) : null}

          <div className={`${udpLogo ? 'md:col-span-4' : 'md:col-span-6'} flex flex-wrap items-start justify-start gap-x-6 gap-y-2 uppercase tracking-[0.14em] md:justify-end`}>
            <Link to="/privacy-policy" className="transition hover:underline hover:underline-offset-4">
              {t('footer_link_privacy') || (ru ? 'Политика конфиденциальности' : 'Privacy')}
            </Link>
            <Link to="/personal-data-consent" className="transition hover:underline hover:underline-offset-4">
              {t('footer_link_consent') || (ru ? 'Согласие на обработку ПД' : 'Personal data consent')}
            </Link>
            {/* Отзыв согласия: стираем выбор и перезагружаем страницу, чтобы
                выгрузить уже поднятые счётчики. Баннер спросит заново. */}
            <button
              type="button"
              onClick={() => {
                revokeConsent();
                window.location.reload();
              }}
              className="uppercase tracking-[0.14em] transition hover:underline hover:underline-offset-4"
            >
              {t('footer_link_cookie') || (ru ? 'Настройки cookie' : 'Cookie settings')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; link: string }>;
}) {
  return (
    <div>
      {title ? (
        <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-paper/55">{title}</div>
      ) : null}
      <ul className="space-y-2 text-[13px] leading-relaxed">
        {items.map((item) => (
          <li key={item.link + item.label}>
            <NavLink
              to={item.link}
              className="block text-paper/85 transition hover:underline hover:underline-offset-4"
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
