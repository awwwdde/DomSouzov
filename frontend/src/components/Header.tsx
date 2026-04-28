import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { lang, setLang } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
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
          <button
            className="burger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={18} strokeWidth={1.9} />
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
