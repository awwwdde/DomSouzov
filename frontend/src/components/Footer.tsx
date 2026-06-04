import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import { useReducedMotionActive } from '../lib/motion';

/* ============================================================ */
/* FOOTER — четырёхколоночная подвал-сетка в духе ZILART.       */
/*  Ряд 1: 4 колонки разделов (Афиша/Залы/О Доме/Все события).  */
/*  Ряд 2: ссылки-плитки (Галерея, Организаторам, Зрителям,     */
/*         Контакты) + блок подписки на рассылку.                */
/*  Ряд 3: адрес, телефон, e-mail, соц-сети.                     */
/*  Ряд 4: copyright + правовые ссылки.                          */
/* ============================================================ */

const COL_AFISHA = [
  { ru: 'Симфонические концерты', en: 'Symphonic concerts', to: '/events' },
  { ru: 'Камерная музыка', en: 'Chamber music', to: '/events' },
  { ru: 'Хоровая программа', en: 'Choral programme', to: '/events' },
  { ru: 'Литературные вечера', en: 'Literary evenings', to: '/events' },
  { ru: 'Календарь', en: 'Calendar', to: '/events' },
];
const COL_HALLS = [
  { ru: 'Колонный зал', en: 'Hall of Columns', to: '/halls' },
  { ru: 'Октябрьский зал', en: 'October Hall', to: '/halls' },
  { ru: 'Малый зал', en: 'Small Hall', to: '/halls' },
  { ru: 'Технический райдер', en: 'Technical rider', to: '/halls' },
];
const COL_ABOUT = [
  { ru: 'История', en: 'History', to: '/about' },
  { ru: 'Архитектура', en: 'Architecture', to: '/about' },
  { ru: 'Команда', en: 'Team', to: '/about' },
  { ru: 'Пресс-релизы', en: 'Press', to: '/news' },
];
const COL_EVENTS = [
  { ru: 'Все события', en: 'All events', to: '/events' },
  { ru: 'Премьеры', en: 'Premieres', to: '/events' },
  { ru: 'Гастроли', en: 'Tours', to: '/events' },
  { ru: 'Выпускные', en: 'Graduations', to: '/events' },
];

const TILE_LINKS = [
  { ru: 'Галерея', en: 'Gallery', to: '/gallery' },
  { ru: 'Организаторам', en: 'For organizers', to: '/organizers' },
  { ru: 'Зрителям', en: 'For visitors', to: '/audience' },
  { ru: 'Контакты', en: 'Contacts', to: '/contacts' },
];

export default function Footer() {
  const { lang, t } = useSite();
  const reduced = useReducedMotionActive();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const l = (item: { ru: string; en: string }) => (lang === 'ru' ? item.ru : item.en);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

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
          <Link
            to="/"
            className="md:col-span-7 group flex items-end gap-6"
            aria-label="Дом Союзов"
          >
            <img
              src="/logo-house.svg"
              alt=""
              className="h-20 w-auto md:h-28"
              style={{ filter: 'invert(1) brightness(1.1)' }}
            />
            <div className="flex flex-col gap-3">
              <span className="font-heading text-[clamp(36px,6vw,72px)] font-bold uppercase leading-[0.92] tracking-[0.02em]">
                {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-paper/55">
                {lang === 'ru' ? 'Колонный зал · Большая Дмитровка 1' : 'Hall of Columns · Bolshaya Dmitrovka 1'}
              </span>
            </div>
          </Link>

          {/* Подписка на рассылку */}
          <form
            onSubmit={onSubmit}
            className="md:col-span-5 flex flex-col gap-4"
            aria-label={lang === 'ru' ? 'Подписаться на рассылку' : 'Subscribe to newsletter'}
          >
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-paper/55">
                {lang === 'ru' ? 'Подписаться на афишу' : 'Subscribe to programme'}
              </span>
              <div className="flex items-center border-b border-paper/30 pb-2 focus-within:border-accent">
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ru' ? 'Электронная почта' : 'Your email'}
                  className="flex-1 bg-transparent text-paper outline-none placeholder:text-paper/40"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-paper px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-paper/90"
                >
                  {lang === 'ru' ? 'Подписаться' : 'Subscribe'}
                </button>
              </div>
            </label>
            <p className="max-w-[44ch] text-[11px] leading-relaxed text-paper/45">
              {subscribed
                ? lang === 'ru'
                  ? 'Спасибо! Вы подписаны на афишу Дома Союзов.'
                  : 'Thank you. You are subscribed to our programme.'
                : lang === 'ru'
                  ? 'Афиша концертов и анонсы публичных программ. Без спама, можно отписаться в любой момент.'
                  : 'Concert programme and public events digest. No spam; you can unsubscribe at any time.'}
            </p>
          </form>
        </motion.div>

        {/* 4 колонки навигации */}
        <div className="grid gap-10 border-b border-paper/10 py-10 md:grid-cols-4 md:gap-10 md:py-14">
          <FooterColumn title={lang === 'ru' ? 'Афиша' : 'Programme'} items={COL_AFISHA} l={l} />
          <FooterColumn title={lang === 'ru' ? 'Залы' : 'Halls'} items={COL_HALLS} l={l} />
          <FooterColumn title={lang === 'ru' ? 'О Доме' : 'About'} items={COL_ABOUT} l={l} />
          <FooterColumn title={lang === 'ru' ? 'События' : 'Events'} items={COL_EVENTS} l={l} />
        </div>

        {/* Плитки-разделы */}
        <div className="grid gap-2 border-b border-paper/10 py-8 md:grid-cols-4 md:gap-3">
          {TILE_LINKS.map((tile) => (
            <Link
              key={tile.to + l(tile)}
              to={tile.to}
              className="group flex items-center justify-between border-b border-paper/10 py-3 font-heading text-[clamp(20px,1.6vw,26px)] font-bold uppercase leading-none tracking-[0.04em] text-paper transition md:border-b-0 md:border-l md:border-paper/15 md:px-5 md:py-4 first:md:border-l-0"
            >
              <span className="relative inline-block after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100">{l(tile)}</span>
              <span aria-hidden className="text-paper/40 transition group-hover:translate-x-1 group-hover:text-paper">→</span>
            </Link>
          ))}
        </div>

        {/* Контакты + соц-сети */}
        <div className="grid gap-10 border-b border-paper/10 py-10 md:grid-cols-12 md:gap-10 md:py-12">
          <div className="md:col-span-5 space-y-2 text-[13px] leading-relaxed">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/55">
              {lang === 'ru' ? 'Адрес' : 'Address'}
            </div>
            <address className="not-italic text-paper/85">
              {t('address_ru') || (lang === 'ru' ? 'Большая Дмитровка 1, Москва' : 'Bolshaya Dmitrovka 1, Moscow')}
            </address>
            <p className="text-paper/55">
              {lang === 'ru'
                ? 'Ст. метро «Охотный ряд», «Театральная»'
                : 'Okhotny Ryad, Teatralnaya metro stations'}
            </p>
          </div>
          <div className="md:col-span-4 space-y-2 text-[13px] leading-relaxed">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/55">
              {lang === 'ru' ? 'Связь' : 'Contact'}
            </div>
            {t('phone') ? (
              <a className="block font-mono text-[15px] font-medium text-paper transition hover:underline hover:underline-offset-4" href={`tel:${t('phone')}`}>
                {t('phone')}
              </a>
            ) : null}
            {t('email_press') || t('contact_email') ? (
              <a
                className="block text-paper/85 transition hover:underline hover:underline-offset-4"
                href={`mailto:${t('contact_email') || t('email_press')}`}
              >
                {t('contact_email') || t('email_press')}
              </a>
            ) : null}
            <p className="text-paper/55">
              {lang === 'ru'
                ? t('hours_ru') || 'Касса: пн–вс 11:00–20:00'
                : t('hours_en') || 'Box office: Mon–Sun 11:00–20:00'}
            </p>
          </div>
          <div className="md:col-span-3 space-y-2 text-[13px] leading-relaxed">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/55">
              {lang === 'ru' ? 'Соцсети' : 'Social'}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] uppercase tracking-[0.18em]">
              <a href="#" className="border-b border-paper/30 pb-px text-paper transition hover:border-paper">VK</a>
              <a href="#" className="border-b border-paper/30 pb-px text-paper transition hover:border-paper">Telegram</a>
              <a href="#" className="border-b border-paper/30 pb-px text-paper transition hover:border-paper">YouTube</a>
            </div>
          </div>
        </div>

        {/* Реквизиты + копирайт */}
        <div className="grid gap-6 pt-8 text-[11px] leading-relaxed text-paper/45 md:grid-cols-12">
          <div className="md:col-span-6 space-y-1">
            <div>© {year} {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}</div>
            {t('legal_full_name') ? <div>{t('legal_full_name')}</div> : null}
            <div className="flex flex-wrap gap-x-4">
              {t('legal_inn') ? <span>ИНН {t('legal_inn')}</span> : null}
              {t('legal_ogrn') ? <span>{lang === 'ru' ? 'ОГРН' : 'OGRN'} {t('legal_ogrn')}</span> : null}
              {t('legal_kpp') ? <span>КПП {t('legal_kpp')}</span> : null}
            </div>
            {t('legal_address') ? <div>{t('legal_address')}</div> : null}
          </div>
          <div className="md:col-span-6 flex flex-wrap items-start justify-start gap-x-6 gap-y-2 uppercase tracking-[0.14em] md:justify-end">
            <Link to="/privacy-policy" className="transition hover:underline hover:underline-offset-4">
              {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy'}
            </Link>
            <Link to="/personal-data-consent" className="transition hover:underline hover:underline-offset-4">
              {lang === 'ru' ? 'Согласие на обработку ПД' : 'Personal data consent'}
            </Link>
            <Link to="/terms" className="transition hover:underline hover:underline-offset-4">
              {lang === 'ru' ? 'Пользовательское соглашение' : 'Terms'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  l,
}: {
  title: string;
  items: ReadonlyArray<{ ru: string; en: string; to: string }>;
  l: (item: { ru: string; en: string }) => string;
}) {
  return (
    <div>
      <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-paper/55">
        {title}
      </div>
      <ul className="space-y-2 text-[13px] leading-relaxed">
        {items.map((item) => (
          <li key={item.to + l(item)}>
            <Link
              to={item.to}
              className="block text-paper/85 transition hover:underline hover:underline-offset-4"
            >
              {l(item)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
