import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function Home() {
  const { lang, content, t } = useSite();
  const events = content?.events ?? [];
  const news = content?.news ?? [];
  const nextEvent = events[0] ?? null;
  const upcoming = events.slice(0, 5);
  const chronicles = news.slice(0, 3);
  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <div className="home-page">
      <section className="home-hero">
        {heroVideo ? (
          <video
            className="home-hero-video"
            src={heroVideo}
            poster={heroPoster || undefined}
            muted
            autoPlay
            loop
            playsInline
          />
        ) : (
          <div className="home-hero-fallback" />
        )}

        <div className="home-hero-overlay" />
        <div className="home-hero-label serif">
          {lang === 'ru' ? 'Дом Союзов' : 'House of Unions'}
        </div>

        <div className="home-next-event">
          <div className="home-next-event-kicker mono">
            {lang === 'ru' ? 'Ближайшее мероприятие' : 'Upcoming event'}
          </div>
          {nextEvent ? (
            <>
              <h2 className="home-next-event-title serif">{l(nextEvent.title)}</h2>
              <p className="home-next-event-meta">
                {l(nextEvent.date)} · {nextEvent.time}
              </p>
              <p className="home-next-event-meta">
                {l(nextEvent.hall)} · {lang === 'ru' ? 'билеты' : 'tickets'} {l(nextEvent.price)}
              </p>
              <Link to={`/events/${nextEvent.id}`} className="btn solid">
                {lang === 'ru' ? 'Подробнее' : 'Details'}
              </Link>
            </>
          ) : (
            <p className="home-next-event-empty">
              {lang === 'ru' ? 'Скоро появится афиша ближайших событий.' : 'Upcoming events will be published soon.'}
            </p>
          )}
        </div>
      </section>

      <section className="home-about">
        <div className="home-about-kicker mono">
          {lang === 'ru' ? 'Историческая площадка Москвы' : 'Historic Moscow venue'}
        </div>
        <p className="home-about-text">
          {lang === 'ru'
            ? 'Дом Союзов - историческая площадка для концертов, форумов и культурных событий в центре Москвы.'
            : 'House of Unions is a historic venue for concerts, forums, and cultural events in the heart of Moscow.'}
        </p>
        <div className="home-about-actions">
          <Link to="/events" className="btn solid">
            {lang === 'ru' ? 'Афиша' : 'Programme'}
          </Link>
          <Link to="/organizers" className="btn">
            {lang === 'ru' ? 'Организаторам' : 'For Organizers'}
          </Link>
        </div>
      </section>

      <section className="home-visit">
        <div className="home-visit-copy">
          <div className="kicker mono">{lang === 'ru' ? 'Спланировать визит' : 'Plan your visit'}</div>
          <h2 className="serif">
            {lang === 'ru' ? 'Откройте для себя концерты и события в Доме Союзов' : 'Discover concerts and events at House of Unions'}
          </h2>
          <p>
            {lang === 'ru'
              ? 'Пн-Вс, удобное время посещения, исторические залы и современная программа.'
              : 'Open all week, convenient visiting hours, historic halls, and contemporary programming.'}
          </p>
        </div>
        <div className="home-visit-meta">
          <div>
            <span className="mono">{lang === 'ru' ? 'Адрес' : 'Address'}</span>
            <strong>{lang === 'ru' ? 'Большая Дмитровка, 1' : 'Bolshaya Dmitrovka, 1'}</strong>
          </div>
          <div>
            <span className="mono">{lang === 'ru' ? 'Режим работы' : 'Opening hours'}</span>
            <strong>{t('hours_ru') || (lang === 'ru' ? 'Ежедневно' : 'Daily')}</strong>
          </div>
          <Link to="/contacts" className="btn solid">
            {lang === 'ru' ? 'Как добраться' : 'Get directions'}
          </Link>
        </div>
      </section>

      <section className="home-calendar">
        <div className="section-head">
          <div>
            <div className="kicker mono">
              {lang === 'ru' ? 'Календарь событий' : 'Event calendar'}
            </div>
            <h2 className="serif">{lang === 'ru' ? '5 ближайших мероприятий' : '5 upcoming events'}</h2>
          </div>
        </div>

        <div className="home-calendar-list">
          {upcoming.length > 0 ? (
            upcoming.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="home-calendar-item">
                <div className="home-calendar-image ph-img">
                  {event.image ? (
                    <img src={event.image} alt={l(event.title)} />
                  ) : (
                    <div className="ph-label">[ {l(event.title)} ]</div>
                  )}
                </div>
                <div className="home-calendar-main">
                  <h3 className="home-calendar-title serif">{l(event.title)}</h3>
                  <div className="home-calendar-place">{l(event.hall)}</div>
                </div>
                <div className="home-calendar-meta">
                  <span>{event.weekday[lang]}</span>
                  <span>{l(event.date)}</span>
                  <span>{event.time}</span>
                  <span>{lang === 'ru' ? 'Билет' : 'Ticket'}: {l(event.price)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="home-empty">
              {lang === 'ru' ? 'Календарь скоро появится.' : 'Calendar will be available soon.'}
            </div>
          )}
        </div>
      </section>

      <section className="home-chronicles">
        <div className="section-head">
          <div>
            <div className="kicker mono">{lang === 'ru' ? 'Новости' : 'News'}</div>
            <h2 className="serif">{lang === 'ru' ? 'Хроники' : 'Chronicles'}</h2>
          </div>
          <div className="r">
            <Link to="/news" className="btn">
              {lang === 'ru' ? 'Все новости' : 'All news'}
            </Link>
          </div>
        </div>

        <div className="home-chronicles-grid">
          {chronicles.length > 0 ? (
            chronicles.map((article, i) => (
              <Link
                key={article.id}
                to={`/news/${article.id}`}
                className={`home-chronicle-card ${i === 0 ? 'home-chronicle-lead' : ''}`}
              >
                <div className="home-chronicle-image ph-img">
                  {article.image ? (
                    <img src={article.image} alt={l(article.title)} />
                  ) : (
                    <div className="ph-label">[ {l(article.tag)} ]</div>
                  )}
                </div>
                <div className="home-chronicle-tag mono">{l(article.tag)}</div>
                <h3 className="home-chronicle-title serif">{l(article.title)}</h3>
                <p className="home-chronicle-excerpt">{l(article.excerpt)}</p>
              </Link>
            ))
          ) : (
            <div className="home-empty">
              {lang === 'ru' ? 'Новости скоро появятся.' : 'News will be published soon.'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
