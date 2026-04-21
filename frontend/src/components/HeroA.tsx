import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function HeroA() {
  const { lang, t } = useSite();
  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');

  return (
    <section className="hero-a">
      <div className="hero-bleed">
        <div className="hero-bleed-inner">
          {heroVideo ? (
            <video
              className="hero-video"
              src={heroVideo}
              poster={heroPoster || undefined}
              muted
              autoPlay
              loop
              playsInline
            />
          ) : null}
          <div className="hero-bleed-overlay" />
          {!heroVideo ? (
            <div className="hero-bleed-ph">
              {lang === 'ru' ? '[ ДОБАВЬТЕ ВИДЕО В АДМИНКЕ ]' : '[ ADD HERO VIDEO IN ADMIN PANEL ]'}
            </div>
          ) : null}
        </div>
      </div>

      <div className="hero-meta">
        <div className="hero-meta-left">
          <div className="hero-kicker mono">
            {t('hero_kicker_ru')}
          </div>
          <h1 className="hero-title serif">
            {lang === 'ru' ? 'ДОМ' : 'HOUSE'}
            <br />
            {lang === 'ru' ? 'СОЮЗОВ' : 'OF UNIONS'}
            <span className="hero-sub">{t('hero_subtitle_ru')}</span>
          </h1>
        </div>

        <div className="hero-meta-right">
          <dl className="hero-kv mono">
            <dt>{lang === 'ru' ? 'Адрес' : 'Address'}</dt>
            <dd>{lang === 'ru' ? 'Большая Дмитровка 1 · Москва' : 'Bolshaya Dmitrovka 1 · Moscow'}</dd>
            <dt>{lang === 'ru' ? 'Часы' : 'Hours'}</dt>
            <dd>{t('hours_ru')}</dd>
            <dt>{lang === 'ru' ? 'Ближайшее' : 'Upcoming'}</dt>
            <dd>{t('next_event_ru')}</dd>
            <dt>{lang === 'ru' ? 'Билеты' : 'Tickets'}</dt>
            <dd>{lang === 'ru' ? 'от 1 500 ₽' : 'from 1,500 ₽'}</dd>
          </dl>
          <div className="hero-cta">
            <Link to="/events" className="btn solid">
              {lang === 'ru' ? 'КУПИТЬ БИЛЕТ' : 'BUY TICKET'} →
            </Link>
            <Link to="/events" className="btn">
              {lang === 'ru' ? 'АФИША' : 'PROGRAMME'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
