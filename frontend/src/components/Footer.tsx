import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

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
    <footer className="mt-24 border-t border-line px-6 py-10 text-ink md:px-12">
      <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <div className="font-heading text-5xl font-semibold uppercase leading-none tracking-[-0.03em]">
            {lang === 'ru' ? 'ДОМ СОЮЗОВ' : 'HOUSE OF UNIONS'}
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-ink-soft">{tagline}</p>
        </div>

        <div>
          <h6 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Навигация' : 'Navigate'}</h6>
          <ul className="grid gap-2 text-sm text-ink-soft">
            {nav[lang].map((item) => (
              <li key={item.to}>
                <Link className="transition hover:text-ink" to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Посетителям' : 'Visit'}</h6>
          <ul className="grid gap-2 text-sm text-ink-soft">
            {visit[lang].map((label) => (
              <li key={label}><Link className="transition hover:text-ink" to="/audience">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Контакты' : 'Contacts'}</h6>
          <ul className="grid gap-2 text-sm leading-6 text-ink-soft">
            <li>{address}</li>
            <li>{hours}</li>
            <li>{phone}</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        <span>© 2026 {lang === 'ru' ? 'Дом Союзов · Все права защищены' : 'House of Unions · All rights reserved'}</span>
        <span>Разработано awwwdde </span>
      </div>
    </footer>
  );
}
