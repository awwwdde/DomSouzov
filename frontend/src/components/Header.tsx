import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Eye, Menu, X } from 'lucide-react';

type VisionFont = 'normal' | 'large' | 'xlarge';
type VisionTheme = 'light' | 'dark';

interface VisionSettings {
  enabled: boolean;
  font: VisionFont;
  theme: VisionTheme;
}

const DEFAULT_VISION_SETTINGS: VisionSettings = {
  enabled: false,
  font: 'large',
  theme: 'light',
};

const VISION_STORAGE_KEY = 'domsouzov-vision-settings';

function readVisionSettings(): VisionSettings {
  try {
    const raw = window.localStorage.getItem(VISION_STORAGE_KEY);
    return raw ? { ...DEFAULT_VISION_SETTINGS, ...JSON.parse(raw) } : DEFAULT_VISION_SETTINGS;
  } catch {
    return DEFAULT_VISION_SETTINGS;
  }
}

export default function Header() {
  const { lang, setLang } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
  const [visionSettings, setVisionSettings] = useState<VisionSettings>(readVisionSettings);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const overlayNav = [
    { label_ru: 'О Доме Союзов', label_en: 'About the House', to: '/about' },
    { label_ru: 'Залы', label_en: 'Halls', to: '/halls' },
    { label_ru: 'Галерея', label_en: 'Gallery', to: '/gallery' },
    { label_ru: 'Афиша', label_en: 'Programme', to: '/events' },
    { label_ru: 'Организаторам', label_en: 'For Organizers', to: '/organizers' },
    { label_ru: 'Зрителям', label_en: 'For Visitors', to: '/audience' },
    { label_ru: 'Контакты', label_en: 'Contacts', to: '/contacts' },
  ];

  const handleNav = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.vision = visionSettings.enabled ? 'true' : 'false';
    root.dataset.visionFont = visionSettings.font;
    root.dataset.visionTheme = visionSettings.theme;
    window.localStorage.setItem(VISION_STORAGE_KEY, JSON.stringify(visionSettings));
  }, [visionSettings]);

  const updateVision = (next: Partial<VisionSettings>) => {
    setVisionSettings((current) => ({ ...current, ...next }));
  };

  const controlClass = [
    'inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition duration-200 ease-ds',
    isHome
      ? 'border-white/35 bg-black/25 text-white hover:bg-black/40'
      : 'border-line bg-white/85 text-ink shadow-sm hover:bg-white',
  ].join(' ');

  const visionButtonClass = [
    controlClass,
    visionSettings.enabled ? 'ring-2 ring-accent ring-offset-2 ring-offset-transparent' : '',
  ].filter(Boolean).join(' ');

  const panelButtonClass = 'min-h-9 rounded-full border border-line px-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink transition hover:bg-paper';
  const activePanelButtonClass = 'border-ink bg-ink text-white hover:bg-ink';

  return (
    <>
      <header className={isHome ? 'fixed inset-x-0 top-0 z-[200] px-6 py-5 md:px-12' : 'sticky inset-x-0 top-0 z-50 px-6 py-5 md:px-12'}>
        <nav className="flex w-full items-center gap-3">
          <Link to="/" className={isHome ? 'mr-auto font-heading text-2xl font-semibold leading-none text-white' : 'mr-auto font-heading text-2xl font-semibold leading-none text-ink'}>
            {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
          </Link>
          <button
            className={controlClass}
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
          >
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
          <div className="relative inline-flex">
            <button
              className={visionButtonClass}
              onClick={() => {
                updateVision({ enabled: !visionSettings.enabled });
                setVisionOpen(true);
              }}
              aria-label={lang === 'ru' ? 'Версия для слабовидящих' : 'Accessible version'}
              aria-expanded={visionOpen}
            >
              <Eye size={22} />
            </button>
            {visionOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-[260] w-[min(340px,calc(100vw-32px))] rounded-2xl border border-line bg-white p-4 text-ink shadow-2xl">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <strong className="text-xs font-bold uppercase tracking-[0.12em]">{lang === 'ru' ? 'Версия для слабовидящих' : 'Accessible version'}</strong>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-xl leading-none" onClick={() => setVisionOpen(false)} aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}>×</button>
                </div>
                <div className="grid gap-2 border-t border-line py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Режим' : 'Mode'}</span>
                  <button
                    type="button"
                    className={`${panelButtonClass} ${visionSettings.enabled ? activePanelButtonClass : ''}`}
                    onClick={() => updateVision({ enabled: !visionSettings.enabled })}
                  >
                    {visionSettings.enabled ? (lang === 'ru' ? 'Включен' : 'On') : (lang === 'ru' ? 'Выключен' : 'Off')}
                  </button>
                </div>
                <div className="grid gap-2 border-t border-line py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Текст' : 'Text'}</span>
                  <div className="flex flex-wrap gap-2">
                    {(['normal', 'large', 'xlarge'] as VisionFont[]).map((font) => (
                      <button
                        type="button"
                        key={font}
                        className={`${panelButtonClass} ${visionSettings.font === font ? activePanelButtonClass : ''}`}
                        onClick={() => updateVision({ enabled: true, font })}
                      >
                        {font === 'normal' ? 'A' : font === 'large' ? 'A+' : 'A++'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2 border-t border-line py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Контраст' : 'Contrast'}</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`${panelButtonClass} ${visionSettings.theme === 'light' ? activePanelButtonClass : ''}`}
                      onClick={() => updateVision({ enabled: true, theme: 'light' })}
                    >
                      {lang === 'ru' ? 'Светлый' : 'Light'}
                    </button>
                    <button
                      type="button"
                      className={`${panelButtonClass} ${visionSettings.theme === 'dark' ? activePanelButtonClass : ''}`}
                      onClick={() => updateVision({ enabled: true, theme: 'dark' })}
                    >
                      {lang === 'ru' ? 'Темный' : 'Dark'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <button
            className={`${controlClass} px-0`}
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      {/* Full-screen overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[220] bg-paper px-6 py-8 text-ink md:px-12">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">{lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}</span>
            <button className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]" onClick={() => setMenuOpen(false)}>
              {lang === 'ru' ? 'ЗАКРЫТЬ' : 'CLOSE'}
              <X size={14} strokeWidth={2} />
            </button>
          </div>
          <div className="grid h-[calc(100%-72px)] items-end gap-10 pt-12 md:grid-cols-[1fr_1.1fr]">
            <nav>
              <ul className="grid gap-3">
                {overlayNav.map((item, i) => (
                  <li key={item.to}>
                    <button onClick={() => handleNav(item.to)} className="inline-flex items-baseline gap-4 bg-transparent font-heading text-[clamp(44px,7vw,104px)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-ink transition hover:opacity-70">
                      <span className="font-sans text-[10px] font-semibold tracking-[0.16em] text-muted">0{i + 1}</span>
                      {lang === 'ru' ? item.label_ru : item.label_en}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="grid gap-8 self-end md:grid-cols-2">
              <div>
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {lang === 'ru' ? 'Сейчас в афише' : 'On now'}
                </div>
                <div className="whitespace-pre-line font-heading text-4xl font-semibold uppercase leading-none">
                  {lang === 'ru' ? 'Эпоха великих\nкомпозиторов' : 'The Age of\nGreat Composers'}
                </div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  19.VI · 19:30 · {lang === 'ru' ? 'Колонный зал' : 'Hall of Columns'}
                </div>
              </div>
              <div>
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {lang === 'ru' ? 'Контакты' : 'Contact'}
                </div>
                <div className="leading-7 text-ink-soft">
                  {lang === 'ru' ? 'Большая Дмитровка 1' : 'Bolshaya Dmitrovka 1'}<br />
                  {lang === 'ru' ? 'Москва' : 'Moscow'}<br />
                  +7 (495) 000-00-00
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
