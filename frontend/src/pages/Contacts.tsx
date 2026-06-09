import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';

const ADDRESS_QUERY = 'Москва, Большая Дмитровка, 1';
const DEFAULT_MAP_EMBED = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(ADDRESS_QUERY)}&z=16`;
const ROUTE_URL = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(ADDRESS_QUERY)}&rtt=mt`;

export default function Contacts() {
  const { lang, t } = useSite();
  const mapEmbed = t('map_embed_url') || DEFAULT_MAP_EMBED;

  return (
    <>
      <Seo
        title={lang === 'ru' ? 'Контакты — Дом Союзов' : 'Contacts — House of Unions'}
        description={
          lang === 'ru'
            ? 'Адрес, телефон, билетная касса и схема проезда: Большая Дмитровка 1, Москва.'
            : 'Address, phone, box office and directions: Bolshaya Dmitrovka 1, Moscow.'
        }
        path="contacts"
        lang={lang}
      />
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Контакты' : 'Home · Contacts'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">{lang === 'ru' ? 'Контакты' : 'Contacts'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Билетная касса, аренда, пресс-служба, администрация — все контакты и часы работы.'
            : 'Box office, hire, press, administration — contacts and opening hours.'}
        </p>
      </RevealSection>

      <RevealSection className="grid gap-10 px-5 py-16 md:grid-cols-[1fr_1fr] md:px-12">
        <div>
          <PageKicker>{lang === 'ru' ? 'Расположение' : 'Location'}</PageKicker>
          <h2 className="font-heading text-[clamp(42px,5vw,78px)] font-bold uppercase leading-[0.88] tracking-[0.04em]">
            {lang === 'ru' ? 'Москва · Большая Дмитровка 1' : 'Moscow · Bolshaya Dmitrovka 1'}
          </h2>
          <dl className="mt-8 grid grid-cols-[120px_1fr] gap-x-5 gap-y-5 text-sm">
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Касса' : 'Box office'}</dt>
            <dd className="leading-6 text-ink-soft">
              {t('phone')}<br />
              <span className="text-muted">{lang === 'ru' ? 'Вт–Вс · 10:00—21:30' : 'Tue–Sun · 10:00—21:30'}</span>
            </dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Аренда' : 'Hire'}</dt>
            <dd className="leading-6 text-ink-soft">
              {t('email_rent')}<br />
              <span className="text-muted">+7 (495) 000-11-11</span>
            </dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Пресса' : 'Press'}</dt>
            <dd className="text-ink-soft">{t('email_press')}</dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Метро' : 'Metro'}</dt>
            <dd className="text-ink-soft">{t('metro_ru')}</dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Часы' : 'Hours'}</dt>
            <dd className="leading-6 text-ink-soft">
              {t('hours_ru')}<br />
              <span className="text-muted">{lang === 'ru' ? 'Понедельник — выходной' : 'Monday — closed'}</span>
            </dd>
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={ROUTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-accent bg-accent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition hover:bg-accent-deep"
            >
              {lang === 'ru' ? 'Построить маршрут' : 'Directions'} →
            </a>
            <a href={`mailto:${t('email_rent')}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-transparent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5">{lang === 'ru' ? 'Написать' : 'Email'}</a>
          </div>
        </div>
        <div>
          <div className="min-h-[460px] overflow-hidden border border-line bg-paper">
            <iframe
              title={lang === 'ru' ? 'Карта · Дом Союзов' : 'Map · House of Unions'}
              src={mapEmbed}
              className="h-full min-h-[460px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </RevealSection>
    </>
  );
}
