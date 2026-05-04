import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function Home() {
  const { lang, content, t } = useSite();
  const events = content?.events ?? [];
  const news = content?.news ?? [];
  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const heroRailEvents = events.slice(0, 3);
  const upcomingRibbon = useMemo(() => events.slice(0, 10), [events]);
  const latestNews = news[0] ?? null;

  return (
    <div className="ds-home">
      <section className="ds-hero">
        {heroVideo ? (
          <video
            className="ds-hero-video"
            src={heroVideo}
            poster={heroPoster || undefined}
            muted
            autoPlay
            loop
            playsInline
          />
        ) : (
          <div className="ds-hero-fallback" />
        )}
        <div className="ds-hero-dim" />
        <div className="ds-hero-noise" />

        <div className="ds-hero-layout">
          <div className="ds-hero-main">
            <div className="ds-hero-text" aria-label={lang === 'ru' ? 'Описание площадки' : 'Venue description'}>
              {lang === 'ru' ? (
                <>
                  <span className="serif ds-hero-line ds-hero-line-3">Дом Союзов оживает каждый раз, когда открываются двери перед началом события.</span>
                </>
              ) : (
                <>
                  <span className="serif ds-hero-line ds-hero-line-3">House of Unions comes alive every time the doors open before the show.</span>
                </>
              )}
            </div>
            <div className="ds-hero-actions">
              <Link to="/events" className="btn solid">
                {lang === 'ru' ? 'Смотреть афишу' : 'View programme'}
              </Link>
              <Link to="/about" className="btn">
                {lang === 'ru' ? 'О площадке' : 'About venue'}
              </Link>
            </div>
          </div>

          <aside className="ds-hero-rail">
            <div className="ds-hero-rail-head">
              <span className="mono">{lang === 'ru' ? 'Будущие мероприятия' : 'Upcoming events'}</span>
              <Link to="/events" className="ds-link-arrow">
                {lang === 'ru' ? 'Все' : 'All'}
              </Link>
            </div>
            {heroRailEvents.length > 0 ? (
              <div className="ds-hero-rail-list">
                {heroRailEvents.map((event) => (
                  <Link to={`/events/${event.id}`} className="ds-hero-rail-item" key={event.id}>
                    <div className="ds-hero-rail-image ph-img">
                      {event.image ? (
                        <img src={event.image} alt={l(event.title)} />
                      ) : (
                        <div className="ph-label">[ {l(event.title)} ]</div>
                      )}
                    </div>
                    <div className="ds-hero-rail-meta">
                      <strong>{l(event.title)}</strong>
                      <span>{l(event.date)} · {event.time}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="ds-empty">{lang === 'ru' ? 'События скоро появятся.' : 'Events will be added soon.'}</div>
            )}
          </aside>
        </div>
      </section>

      <section className="ds-ribbon-wrap">
        <div className="ds-ribbon-head">
          <h2 className="serif">{lang === 'ru' ? 'Лента ближайших событий' : 'Upcoming events ribbon'}</h2>
        </div>
        {upcomingRibbon.length > 0 ? (
          <div className="ds-ribbon" role="list">
            {upcomingRibbon.map((event) => (
              <Link to={`/events/${event.id}`} className="ds-ribbon-item" role="listitem" key={event.id}>
                <span className="mono">{l(event.date)}</span>
                <strong>{l(event.title)}</strong>
                <em>{event.time} · {l(event.hall)}</em>
              </Link>
            ))}
          </div>
        ) : (
          <div className="ds-empty">{lang === 'ru' ? 'Афиша скоро обновится.' : 'Programme will be updated soon.'}</div>
        )}
      </section>

      <section className="ds-news-inline">
        <div className="ds-news-inline-content">
          <span className="mono">{lang === 'ru' ? 'Новости Дома Союзов' : 'House news'}</span>
          <h3 className="serif">
            {latestNews ? l(latestNews.title) : (lang === 'ru' ? 'Скоро здесь появятся актуальные новости и анонсы.' : 'Latest news and announcements will appear here soon.')}
          </h3>
          {latestNews ? <p>{l(latestNews.excerpt)}</p> : null}
        </div>
        <div className="ds-news-inline-actions">
          <Link to="/news" className="btn solid">{lang === 'ru' ? 'Читать новости' : 'Read news'}</Link>
          <Link to="/contacts" className="btn">{lang === 'ru' ? 'Контакты' : 'Contacts'}</Link>
        </div>
      </section>
    </div>
  );
}
