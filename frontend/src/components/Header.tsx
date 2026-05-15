import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, Menu, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useVisionModeContext } from '../context/VisionModeContext';
import VisionModePanel from './VisionModePanel';
import { Container } from './Section';

const PRIMARY_NAV = [
  { to: '/events', ru: 'Афиша', en: 'Programme' },
  { to: '/news', ru: 'Новости', en: 'News' },
  { to: '/organizers', ru: 'Организаторам', en: 'For organizers' },
] as const;

/** Разделы в полноэкранном меню (design.md §4.1). */
const OVERLAY_NAV = [
  { to: '/halls', ru: 'Залы', en: 'Halls' },
  { to: '/gallery', ru: 'Галерея', en: 'Gallery' },
  { to: '/about', ru: 'О Доме', en: 'About' },
  { to: '/contacts', ru: 'Контакты', en: 'Contacts' },
  { to: '/audience', ru: 'Зрителям', en: 'For visitors' },
] as const;

export default function Header() {
  const { lang, setLang, t } = useSite();
  const { panelOpen, setPanelOpen, settings } = useVisionModeContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setPanelOpen(false);
  }, [location.pathname, setPanelOpen]);

  const l = (item: { ru: string; en: string }) => (lang === 'ru' ? item.ru : item.en);

  const handleNav = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  const navLinkClass =
    'relative py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink transition after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition hover:text-accent hover:after:scale-x-100';

  const iconBtn =
    'inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-line bg-paper-soft text-ink transition hover:border-ink/30';

  return (
    <>
      <header className="sticky top-0 z-[200] h-16 border-b border-line bg-paper-soft md:h-[72px]">
        <Container className="flex h-full items-center justify-between gap-3">
          <Link
            to="/"
            className="font-heading text-[18px] font-bold uppercase leading-none tracking-[-0.02em] text-ink"
          >
            {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label={lang === 'ru' ? 'Основное меню' : 'Main'}>
            {PRIMARY_NAV.map((item) => (
              <Link key={item.to} to={item.to} className={navLinkClass}>
                {l(item)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              className={`${iconBtn} px-4 text-[11px] font-bold uppercase tracking-[0.16em]`}
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
              <Eye size={22} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={`${iconBtn} px-0 md:px-1`}
              onClick={() => setMenuOpen(true)}
              aria-label={lang === 'ru' ? 'Меню' : 'Menu'}
              aria-expanded={menuOpen}
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>
          </div>
        </Container>
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

      {menuOpen ? (
        <div className="fixed inset-0 z-[220] bg-paper px-5 py-6 text-ink md:px-12">
          <div className="mx-auto flex h-full max-w-[1600px] flex-col">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
              </span>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-line text-2xl leading-none"
                onClick={() => setMenuOpen(false)}
                aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
              >
                <X size={22} />
              </button>
            </div>
            <nav className="mt-10 flex flex-1 flex-col gap-4 overflow-y-auto" aria-label="Menu">
              {OVERLAY_NAV.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => handleNav(item.to)}
                  className="bg-transparent text-left font-heading text-[clamp(28px,5vw,56px)] font-bold uppercase leading-[0.95] tracking-[0.04em] text-ink transition hover:text-accent"
                >
                  {l(item)}
                </button>
              ))}
            </nav>
            <div className="border-t border-line pt-6 text-sm leading-6 text-ink-soft">
              <div>{t('address_ru')}</div>
              <div>{t('phone')}</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
