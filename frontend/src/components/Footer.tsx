import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import './Footer.css';

export default function Footer() {
  const { lang, t } = useSite();

  const nav = {
    ru: [
      { label: 'О Доме Союзов', to: '/about' },
      { label: 'Афиша', to: '/events' },
      { label: 'Залы', to: '/halls' },
      { label: 'Галерея', to: '/gallery' },
    ],
    en: [
      { label: 'About', to: '/about' },
      { label: 'Programme', to: '/events' },
      { label: 'Halls', to: '/halls' },
      { label: 'Gallery', to: '/gallery' },
    ],
  };

  const visit = {
    ru: ['Билеты', 'Режим работы', 'Как добраться', 'Доступная среда'],
    en: ['Tickets', 'Opening hours', 'Getting here', 'Accessibility'],
  };

  const address = t('address_ru');
  const hours = t('hours_ru');
  const phone = t('phone');
  const tagline = t('footer_tagline_ru');

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo serif">
            {lang === 'ru' ? 'ДОМ СОЮЗОВ' : 'HOUSE OF UNIONS'}
          </div>
          <p className="footer-tagline">{tagline}</p>
        </div>

        <div>
          <h6 className="footer-col-head mono">{lang === 'ru' ? 'Навигация' : 'Navigate'}</h6>
          <ul className="footer-nav-list">
            {nav[lang].map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="footer-col-head mono">{lang === 'ru' ? 'Посетителям' : 'Visit'}</h6>
          <ul className="footer-nav-list">
            {visit[lang].map((label) => (
              <li key={label}><Link to="/audience">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="footer-col-head mono">{lang === 'ru' ? 'Контакты' : 'Contacts'}</h6>
          <ul className="footer-nav-list footer-contact-list">
            <li>{address}</li>
            <li>{hours}</li>
            <li>{phone}</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom mono">
        <span>© 2026 {lang === 'ru' ? 'Дом Союзов · Все права защищены' : 'House of Unions · All rights reserved'}</span>
        <span>DOM SOYUZOV · v1.0</span>
      </div>
    </footer>
  );
}
