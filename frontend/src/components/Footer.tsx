import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSite } from '../context/SiteContext';
import { useReducedMotionActive } from '../lib/motion';

export default function Footer() {
  const { lang, t } = useSite();
  const reduced = useReducedMotionActive();
  const year = new Date().getFullYear();

  const col = (title: string, children: React.ReactNode) => (
    <div>
      <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-paper/60">{title}</div>
      <div className="space-y-2 text-[13px] leading-relaxed text-paper/70">{children}</div>
    </div>
  );

  const navLink = (label: string, to: string) => (
    <Link className="block font-medium text-paper/85 transition hover:text-accent" to={to}>
      {label}
    </Link>
  );

  return (
    <footer className="border-t border-white/10 bg-ink px-5 py-16 text-paper md:px-12 md:py-20">
      <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="font-heading text-[clamp(36px,6vw,64px)] font-bold uppercase leading-[0.95] tracking-[0.04em]">
            {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-paper/70">
            {lang === 'ru' ? 'Москва · с 1784 года' : 'Moscow · since 1784'}
          </p>
        </motion.div>

        {col(
          lang === 'ru' ? 'Навигация' : 'Navigation',
          <>
            {navLink(lang === 'ru' ? 'Афиша' : 'Programme', '/events')}
            {navLink(lang === 'ru' ? 'Залы' : 'Halls', '/halls')}
            {navLink(lang === 'ru' ? 'Галерея' : 'Gallery', '/gallery')}
            {navLink(lang === 'ru' ? 'Новости' : 'News', '/news')}
            {navLink(lang === 'ru' ? 'О Доме' : 'About', '/about')}
            {navLink(lang === 'ru' ? 'Контакты' : 'Contacts', '/contacts')}
            {navLink(lang === 'ru' ? 'Организаторам' : 'For organizers', '/organizers')}
            {navLink(lang === 'ru' ? 'Зрителям' : 'For visitors', '/audience')}
          </>
        )}

        {col(
          lang === 'ru' ? 'Контакты' : 'Contacts',
          <>
            <div>{t('contact_address_ru') || t('address_ru')}</div>
            <div>{t('contact_phone') || t('phone')}</div>
            <a
              href={`mailto:${t('contact_email') || t('email_press')}`}
              className="font-medium text-paper/85 underline-offset-4 transition hover:text-accent"
            >
              {t('contact_email') || t('email_press')}
            </a>
            <div className="pt-1 text-paper/60">
              {lang === 'ru' ? t('contact_hours_ru') || t('hours_ru') : t('contact_hours_en') || t('hours_en')}
            </div>
          </>
        )}

        {col(
          lang === 'ru' ? 'Реквизиты' : 'Legal',
          <>
            <div>{t('legal_full_name')}</div>
            {t('legal_inn') ? <div>ИНН {t('legal_inn')}</div> : null}
            {t('legal_ogrn') ? <div>{lang === 'ru' ? 'ОГРН' : 'OGRN'} {t('legal_ogrn')}</div> : null}
            {t('legal_kpp') ? <div>КПП {t('legal_kpp')}</div> : null}
            <div className="pt-1">{t('legal_address')}</div>
          </>
        )}
      </div>

      <div className="mx-auto mt-14 max-w-[1600px] border-t border-paper/15 pt-8">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-paper/45">
          <span>
            © {year} {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
          </span>
          <span aria-hidden>·</span>
          <Link to="/privacy-policy" className="transition hover:text-accent">
            {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy'}
          </Link>
          <span aria-hidden>·</span>
          <Link to="/personal-data-consent" className="transition hover:text-accent">
            {lang === 'ru' ? 'Согласие на обработку ПД' : 'Personal data consent'}
          </Link>
          <span aria-hidden>·</span>
          <Link to="/terms" className="transition hover:text-accent">
            {lang === 'ru' ? 'Пользовательское соглашение' : 'Terms'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
