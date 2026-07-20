import { useEffect, useState } from 'react';
import { Star, ArrowUpRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection, RevealList, RevealItem } from '../components/Reveal';
import { getReviews } from '../api/client';
import { usePhones, telHref } from '../lib/phones';
import type { Review, ReviewsResponse } from '../types';

const ADDRESS_QUERY = 'Москва, Большая Дмитровка, 1';
const DEFAULT_MAP_EMBED = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(ADDRESS_QUERY)}&z=16`;
const ROUTE_URL = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(ADDRESS_QUERY)}&rtt=mt`;

export default function Contacts() {
  const { lang, t } = useSite();
  const mapEmbed = t('map_embed_url') || DEFAULT_MAP_EMBED;
  const phones = usePhones();

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
      </RevealSection>

      <RevealSection className="grid gap-10 px-5 py-16 md:grid-cols-[1fr_1fr] md:px-12">
        <div>
          <PageKicker>{lang === 'ru' ? 'Расположение' : 'Location'}</PageKicker>
          <h2 className="font-heading text-[clamp(34px,4.4vw,64px)] font-bold uppercase leading-[0.9] tracking-[0.03em] text-balance">
            {lang === 'ru' ? (
              <>Москва · Большая Дмитровка · <span className="whitespace-nowrap">дом&nbsp;1</span></>
            ) : (
              <>Moscow · Bolshaya Dmitrovka · <span className="whitespace-nowrap">bld.&nbsp;1</span></>
            )}
          </h2>
          <dl className="mt-8 grid grid-cols-[120px_1fr] gap-x-5 gap-y-5 text-sm">
            <dt className="font-bold uppercase tracking-[0.08em]">
              {phones.length > 1 ? (lang === 'ru' ? 'Телефоны' : 'Phones') : (lang === 'ru' ? 'Вход' : 'Entrance')}
            </dt>
            <dd className="leading-6 text-ink-soft">
              {phones.map((p) => (
                <span key={p.number} className="block">
                  <a href={telHref(p.number)} className="transition hover:text-accent">{p.number}</a>
                  {p.label ? <span className="text-muted"> · {p.label}</span> : null}
                </span>
              ))}
              <span className="text-muted">{lang === 'ru' ? 'Вт–Вс · 10:00—21:30' : 'Tue–Sun · 10:00—21:30'}</span>
            </dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Залы и мероприятия' : 'Venues'}</dt>
            <dd className="leading-6 text-ink-soft">{t('email_rent')}</dd>
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

      {/* ОТЗЫВЫ — карточки в стиле сайта; данные авто с Яндекс Карт + ручные из CMS. */}
      <ReviewsSection lang={lang} />
    </>
  );
}

/* ----------------------------------------------------------------- */
/* ReviewsSection — витрина отзывов (сетка 4×2).                      */
/*  Данные: GET /api/reviews (ручные из админки + авто с Яндекса,     */
/*  кэш на сервере). Стиль карточек — как блоки на «Зрителям».        */
/* ----------------------------------------------------------------- */
function ReviewsSection({ lang }: { lang: 'ru' | 'en' }) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getReviews()
      .then((d) => alive && setData(d))
      .catch(() => alive && setData({ rating: null, url: '', reviews: [] }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const reviews = data?.reviews ?? [];
  const mapUrl = data?.url || 'https://yandex.ru/maps/org/dom_soyuzov/1101563021/';

  return (
    <RevealSection className="border-t border-line bg-paper px-5 py-16 md:px-12 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <PageKicker>{lang === 'ru' ? 'Отзывы' : 'Reviews'}</PageKicker>
          <h2 className="font-heading text-[clamp(34px,4.5vw,72px)] font-bold uppercase leading-[0.9] tracking-[0.03em] text-ink">
            {lang === 'ru' ? 'Что говорят гости' : 'What guests say'}
          </h2>
        </div>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink bg-transparent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-ink hover:text-paper"
        >
          {data?.rating ? (
            <span className="inline-flex items-center gap-1">
              <Star size={14} className="fill-accent text-accent" />
              {data.rating.toFixed(1)}
            </span>
          ) : null}
          {lang === 'ru' ? 'Все отзывы на Яндексе' : 'All reviews on Yandex'} →
        </a>
      </div>

      {loading ? (
        <p className="mt-10 text-sm uppercase tracking-[0.14em] text-muted">
          {lang === 'ru' ? 'Загружаем отзывы…' : 'Loading reviews…'}
        </p>
      ) : reviews.length === 0 ? (
        <p className="mt-10 max-w-2xl text-base leading-7 text-ink-soft">
          {lang === 'ru'
            ? 'Отзывы появятся здесь. Они подгружаются автоматически с Яндекс Карт.'
            : 'Reviews will appear here. They are loaded automatically from Yandex Maps.'}
        </p>
      ) : (
        <RevealList className="mt-10 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {reviews.map((r, i) => (
            <RevealItem key={`${r.author}-${i}`}>
              <ReviewCard review={r} href={mapUrl} lang={lang} />
            </RevealItem>
          ))}
        </RevealList>
      )}
    </RevealSection>
  );
}

function ReviewCard({ review, href, lang }: { review: Review; href: string; lang: 'ru' | 'en' }) {
  const rating = Math.max(0, Math.min(5, review.rating || 5));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={lang === 'ru' ? 'Открыть отзывы на Яндекс Картах' : 'Open reviews on Yandex Maps'}
      className="group flex h-full flex-col gap-4 bg-paper p-6 transition hover:bg-paper-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center justify-between">
        <span className="flex gap-0.5" aria-label={`${rating} / 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < rating ? 'fill-accent text-accent' : 'text-line'}
              strokeWidth={1.6}
            />
          ))}
        </span>
        <ArrowUpRight
          size={20}
          strokeWidth={1.6}
          className="text-line transition-all group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
      <p className="line-clamp-6 flex-1 text-[14px] leading-6 text-ink-soft">{review.text}</p>
      <div className="mt-1 border-t border-line pt-3">
        <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-ink">{review.author}</div>
        {review.date_label ? (
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-muted">{review.date_label}</div>
        ) : null}
      </div>
    </a>
  );
}
