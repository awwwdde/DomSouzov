import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function HeroA() {
  const { lang, t } = useSite();
  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');

  return (
    <section className="px-6 pt-24 md:px-12">
      <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-[32px]">
        <div className="absolute inset-0">
          {heroVideo ? (
            <video
              className="h-full w-full object-cover"
              src={heroVideo}
              poster={heroPoster || undefined}
              muted
              autoPlay
              loop
              playsInline
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10" />
          {!heroVideo ? (
            <div className="flex h-full items-center justify-center bg-paper text-xs font-bold uppercase tracking-[0.14em] text-muted">
              {lang === 'ru' ? '[ ДОБАВЬТЕ ВИДЕО В АДМИНКЕ ]' : '[ ADD HERO VIDEO IN ADMIN PANEL ]'}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {t('hero_kicker_ru')}
          </div>
          <h1 className="font-heading text-[clamp(72px,12vw,170px)] font-semibold uppercase leading-[0.78] tracking-[-0.07em]">
            {lang === 'ru' ? 'ДОМ' : 'HOUSE'}
            <br />
            {lang === 'ru' ? 'СОЮЗОВ' : 'OF UNIONS'}
            <span className="mt-4 block font-sans text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">{t('hero_subtitle_ru')}</span>
          </h1>
        </div>

        <div className="self-end">
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.12em]">
            <dt>{lang === 'ru' ? 'Адрес' : 'Address'}</dt>
            <dd className="text-ink-soft">{lang === 'ru' ? 'Большая Дмитровка 1 · Москва' : 'Bolshaya Dmitrovka 1 · Moscow'}</dd>
            <dt>{lang === 'ru' ? 'Часы' : 'Hours'}</dt>
            <dd className="text-ink-soft">{t('hours_ru')}</dd>
            <dt>{lang === 'ru' ? 'Ближайшее' : 'Upcoming'}</dt>
            <dd className="text-ink-soft">{t('next_event_ru')}</dd>
            <dt>{lang === 'ru' ? 'Билеты' : 'Tickets'}</dt>
            <dd className="text-ink-soft">{lang === 'ru' ? 'от 1 500 ₽' : 'from 1,500 ₽'}</dd>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/events" className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
              {lang === 'ru' ? 'КУПИТЬ БИЛЕТ' : 'BUY TICKET'} →
            </Link>
            <Link to="/events" className="inline-flex min-h-10 items-center justify-center rounded-full border border-line bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
              {lang === 'ru' ? 'АФИША' : 'PROGRAMME'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
