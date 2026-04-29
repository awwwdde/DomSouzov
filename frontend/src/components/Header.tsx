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

  return (
    <>
      <header className={`site-header ${isHome ? 'site-header-overlay' : ''}`}>
        <nav className="main-nav">
          <Link to="/" className="header-brand serif">
            {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
          </Link>
          <button
            className="cap lang-toggle"
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
          >
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
          <div className="vision-control">
            <button
              className={`cap vision-toggle${visionSettings.enabled ? ' active' : ''}`}
              onClick={() => {
                updateVision({ enabled: !visionSettings.enabled });
                setVisionOpen(true);
              }}
              aria-label={lang === 'ru' ? 'Версия для слабовидящих' : 'Accessible version'}
              aria-expanded={visionOpen}
            >
              <Eye className="header-icon" size={22}  />
            </button>
            {visionOpen ? (
              <div className="vision-panel">
                <div className="vision-panel-head">
                  <strong>{lang === 'ru' ? 'Версия для слабовидящих' : 'Accessible version'}</strong>
                  <button type="button" onClick={() => setVisionOpen(false)} aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}>×</button>
                </div>
                <div className="vision-panel-row">
                  <span>{lang === 'ru' ? 'Режим' : 'Mode'}</span>
                  <button
                    type="button"
                    className={visionSettings.enabled ? 'active' : ''}
                    onClick={() => updateVision({ enabled: !visionSettings.enabled })}
                  >
                    {visionSettings.enabled ? (lang === 'ru' ? 'Включен' : 'On') : (lang === 'ru' ? 'Выключен' : 'Off')}
                  </button>
                </div>
                <div className="vision-panel-row">
                  <span>{lang === 'ru' ? 'Текст' : 'Text'}</span>
                  <div className="vision-options">
                    {(['normal', 'large', 'xlarge'] as VisionFont[]).map((font) => (
                      <button
                        type="button"
                        key={font}
                        className={visionSettings.font === font ? 'active' : ''}
                        onClick={() => updateVision({ enabled: true, font })}
                      >
                        {font === 'normal' ? 'A' : font === 'large' ? 'A+' : 'A++'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="vision-panel-row">
                  <span>{lang === 'ru' ? 'Контраст' : 'Contrast'}</span>
                  <div className="vision-options">
                    <button
                      type="button"
                      className={visionSettings.theme === 'light' ? 'active' : ''}
                      onClick={() => updateVision({ enabled: true, theme: 'light' })}
                    >
                      {lang === 'ru' ? 'Светлый' : 'Light'}
                    </button>
                    <button
                      type="button"
                      className={visionSettings.theme === 'dark' ? 'active' : ''}
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
            className="burger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu className="header-icon" size={24} />
          </button>
        </nav>
      </header>

      {/* Full-screen overlay menu */}
      {menuOpen && (
        <div className="overlay-menu">
          <div className="overlay-head">
            <span className="logo-overlay">{lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}</span>
            <button className="btn overlay-close" onClick={() => setMenuOpen(false)}>
              {lang === 'ru' ? 'ЗАКРЫТЬ' : 'CLOSE'}
              <X size={14} strokeWidth={2} />
            </button>
          </div>
          <div className="overlay-body">
            <nav className="overlay-primary-nav">
              <ul>
                {overlayNav.map((item, i) => (
                  <li key={item.to}>
                    <button onClick={() => handleNav(item.to)} className="overlay-nav-item">
                      <span className="mono overlay-num">0{i + 1}</span>
                      {lang === 'ru' ? item.label_ru : item.label_en}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="overlay-sub">
              <div>
                <div className="mono overlay-sub-head">
                  {lang === 'ru' ? 'Сейчас в афише' : 'On now'}
                </div>
                <div className="overlay-event-title serif">
                  {lang === 'ru' ? 'Эпоха великих\nкомпозиторов' : 'The Age of\nGreat Composers'}
                </div>
                <div className="mono overlay-event-date">
                  19.VI · 19:30 · {lang === 'ru' ? 'Колонный зал' : 'Hall of Columns'}
                </div>
              </div>
              <div>
                <div className="mono overlay-sub-head">
                  {lang === 'ru' ? 'Контакты' : 'Contact'}
                </div>
                <div className="overlay-contact-info">
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
