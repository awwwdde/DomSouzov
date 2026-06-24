import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Menu, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useVisionModeContext } from '../context/VisionModeContext';
import VisionModePanel from './VisionModePanel';
import { useReducedMotionActive } from '../lib/motion';

/* ============================================================ */
/* HEADER — однорядная editorial-шапка.                          */
/*  Один ряд: логотип слева, утилиты + бургер справа.           */
/*  Бургер раскрывает slim горизонтальную полосу с навигацией,  */
/*  не полноэкранный оверлей.                                    */
/* ============================================================ */

const PRIMARY_NAV = [
  { to: '/events', ru: 'Афиша', en: 'Programme' },
  { to: '/halls', ru: 'Залы', en: 'Halls' },
  { to: '/about', ru: 'О Доме', en: 'About' },
  { to: '/gallery', ru: 'Галерея', en: 'Gallery' },
  { to: '/news', ru: 'Новости', en: 'News' },
  { to: '/organizers', ru: 'Организаторам', en: 'Organizers' },
  { to: '/audience', ru: 'Зрителям', en: 'Visitors' },
  { to: '/contacts', ru: 'Контакты', en: 'Contacts' },
] as const;

export default function Header() {
  const { lang, setLang } = useSite();
  const { panelOpen, setPanelOpen, settings } = useVisionModeContext();
  const reduced = useReducedMotionActive();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setPanelOpen(false);
  }, [location.pathname, setPanelOpen]);

  // Esc — закрывает раскрытый рейл навигации.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Блокировка скролла body, пока открыто меню (важно для мобильного оверлея).
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const l = (item: { ru: string; en: string }) => (lang === 'ru' ? item.ru : item.en);

  const handleNav = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  const iconBtn =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-soft text-ink transition hover:border-ink/40';

  return (
    <>
      <header className="sticky top-0 z-[200] border-b border-line bg-paper-soft">
        {/* --- Единственный ряд: логотип + утилиты --- */}
        <div className="mx-auto flex h-[80px] w-full max-w-[1800px] items-center justify-between gap-3 px-5 md:h-[104px] md:w-[95%] md:px-6">
          <Link
            to="/"
            className="flex items-center leading-none"
            aria-label={lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
          >
            <img
              src="/logo-house.svg"
              alt={lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
              className="h-14 w-auto md:h-20"
            />
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              className={`${iconBtn} w-auto px-4 text-[11px] font-bold uppercase tracking-[0.16em]`}
              onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
              aria-label={lang === 'ru' ? 'English' : 'Русский'}
            >
              {lang === 'ru' ? 'EN' : 'RU'}
            </button>
            <button
              type="button"
              className={[iconBtn, settings.enabled ? 'border-accent text-accent' : ''].join(' ')}
              onClick={() => setPanelOpen(true)}
              aria-label={lang === 'ru' ? 'Версия для слабовидящих' : 'Vision accessibility'}
              aria-expanded={panelOpen}
            >
              <Eye size={22} strokeWidth={1.6} />
            </button>
            <Link
              to="/events"
              className="hidden h-11 items-center justify-center rounded-full bg-accent px-5 text-[11px] font-bold uppercase tracking-[0.18em] text-paper transition hover:bg-accent-deep md:inline-flex"
            >
              {lang === 'ru' ? 'Мероприятия' : 'Programme'}
            </Link>
            <button
              type="button"
              className={iconBtn}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={lang === 'ru' ? 'Меню' : 'Menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
            </button>
          </div>
        </div>

        {/* --- Slim горизонтальный рейл (раскрывается по бургеру) ---       */}
        {/* Позиционирован absolute, чтобы не сдвигать контент страницы вниз. */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav
              key="nav-rail"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              data-lenis-prevent
              className="absolute inset-x-0 top-full max-h-[calc(100vh-80px)] overflow-y-auto border-t border-line bg-paper-soft shadow-[0_18px_40px_-24px_rgba(20,20,19,0.35)] lg:max-h-none lg:overflow-visible"
              aria-label={lang === 'ru' ? 'Основное меню' : 'Main'}
            >
              <motion.div
                className="mx-auto flex w-full max-w-[1800px] flex-col items-stretch px-5 py-4 lg:w-[95%] lg:flex-row lg:gap-x-16 lg:overflow-x-auto lg:px-6 lg:py-6 lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden"
                variants={{
                  hidden: {},
                  visible: {
                    transition: reduced
                      ? { staggerChildren: 0 }
                      : { staggerChildren: 0.04, delayChildren: 0.15 },
                  },
                }}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {PRIMARY_NAV.map((item) => (
                  <motion.button
                    key={item.to + l(item)}
                    type="button"
                    onClick={() => handleNav(item.to)}
                    variants={{
                      hidden: reduced ? { opacity: 1 } : { opacity: 0 },
                      visible: { opacity: 1 },
                    }}
                    transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative shrink-0 whitespace-nowrap border-b border-line bg-transparent py-4 text-left font-heading text-2xl font-bold uppercase leading-none tracking-[0.02em] text-ink transition last:border-b-0 hover:text-accent lg:border-b-0 lg:py-0 lg:text-[clamp(20px,2.4vw,34px)] lg:hover:text-ink"
                  >
                    <span className="block">{l(item)}</span>
                    <span className="mt-2 hidden h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100 lg:block" aria-hidden />
                  </motion.button>
                ))}

                {/* Билеты в мобильном меню (на десктопе кнопка есть в шапке). */}
                <button
                  type="button"
                  onClick={() => handleNav('/events')}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-paper transition md:hidden"
                >
                  {lang === 'ru' ? 'Мероприятия' : 'Programme'}
                </button>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {panelOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[250] bg-ink/30 backdrop-blur-[2px]"
            aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
            onClick={() => setPanelOpen(false)}
          />
          <VisionModePanel />
        </>
      ) : null}
    </>
  );
}
