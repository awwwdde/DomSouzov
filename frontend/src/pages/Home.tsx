import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { lang, content, t } = useSite();
  const events = content?.events ?? [];
  const news = content?.news ?? [];
  const halls = content?.halls ?? [];
  const nextEvent = events[0] ?? null;
  const upcoming = events.slice(0, 8);
  const chronicles = news.slice(0, 6);
  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');
  const [activeHall, setActiveHall] = useState(0);

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const byDate = useMemo(() => {
    const map = new Map<string, typeof upcoming>();
    for (const event of upcoming) {
      const key = l(event.date);
      const current = map.get(key) ?? [];
      map.set(key, [...current, event]);
    }
    return Array.from(map.entries()).map(([date, items]) => ({
      date,
      weekday: items[0]?.weekday[lang] ?? '',
      items,
    }));
  }, [upcoming, lang]);

  const hallCards = halls.slice(0, 3);
  const currentHall = hallCards[activeHall] ?? hallCards[0] ?? null;
  const canSlideHalls = hallCards.length > 1;
  const prevHall = () => setActiveHall((prev) => (prev - 1 + hallCards.length) % hallCards.length);
  const nextHall = () => setActiveHall((prev) => (prev + 1) % hallCards.length);
  const riseIn = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45 },
  } as const;

  return (
    <div className="home-z">
      <section className="home-z-hero">
        {heroVideo ? (
          <video
            className="home-z-hero-video"
            src={heroVideo}
            poster={heroPoster || undefined}
            muted
            autoPlay
            loop
            playsInline
          />
        ) : (
          <div className="home-z-hero-fallback" />
        )}

        <div className="home-z-hero-overlay" />
        <motion.div
          className="home-z-hero-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="home-z-hero-left">
            {nextEvent ? (
              <>
                <div className="home-z-tags">
                  <span>#{l(nextEvent.tag).toLowerCase()}</span>
                  <span>{lang === 'ru' ? '6+' : '6+'}</span>
                </div>
                <div className="home-z-hero-date serif">{l(nextEvent.date)}</div>
                <div className="home-z-hero-meta">
                  {nextEvent.time} · {l(nextEvent.hall)}
                </div>
              </>
            ) : null}
          </div>

          <div className="home-z-hero-right">
            <h1 className="serif home-z-hero-title">
              {nextEvent ? l(nextEvent.title) : (lang === 'ru' ? 'Дом Союзов' : 'House of Unions')}
            </h1>
            <p className="home-z-hero-text">
              {lang === 'ru'
                ? 'Историческая сцена в центре Москвы. Концерты, премьеры, камерные и симфонические программы.'
                : 'Historic stage in central Moscow. Concerts, premieres, chamber and symphonic programmes.'}
            </p>
            <div className="home-z-hero-actions">
              <Link to={nextEvent ? `/events/${nextEvent.id}` : '/events'} className="btn solid">
                {lang === 'ru' ? 'Подробнее' : 'Details'}
              </Link>
              <Link to="/events" className="btn">
                {lang === 'ru' ? 'Вся афиша' : 'All events'}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section className="home-z-statement" {...riseIn}>
        <blockquote className="serif">
          {lang === 'ru'
            ? 'Дом Союзов — историческое пространство, где концерт становится частью городской памяти. Здесь звучат симфонические программы, камерные вечера и премьеры на главной сцене Москвы.'
            : 'House of Unions is a historic space where every concert becomes part of the city memory. Symphonic programmes, chamber evenings and premieres meet on one of Moscow main stages.'}
        </blockquote>
        <Link to="/about" className="btn">{lang === 'ru' ? 'Больше о Доме' : 'More about us'}</Link>
      </motion.section>

      <motion.section className="home-z-featured" {...riseIn}>
        <div className="home-z-head">
          <h2 className="serif">{lang === 'ru' ? 'Рекомендуем' : 'Recommended'}</h2>
          <Link to="/events" className="btn">{lang === 'ru' ? 'Все события' : 'All events'}</Link>
        </div>

        <div className="home-z-featured-track">
          {upcoming.slice(0, 4).map((event) => (
            <Link to={`/events/${event.id}`} className="home-z-featured-card" key={event.id}>
              <div className="home-z-featured-meta mono">{l(event.date)} · {event.time}</div>
              <h3 className="serif">{l(event.title)}</h3>
              <div className="home-z-featured-image ph-img">
                {event.image ? <img src={event.image} alt={l(event.title)} /> : <div className="ph-label">[ {l(event.title)} ]</div>}
              </div>
              <div className="home-z-featured-foot">
                <span>{l(event.tag)}</span>
                <span>{l(event.hall)}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section className="home-z-events" {...riseIn}>
        <div className="home-z-head">
          <h2 className="serif">{lang === 'ru' ? 'События по датам' : 'Events by date'}</h2>
          <Link to="/events" className="btn">{lang === 'ru' ? 'Вся афиша' : 'All events'}</Link>
        </div>

        {byDate.length > 0 ? (
          byDate.map(({ date, weekday, items }, dateIndex) => (
            <div key={date} className="home-z-events-row" style={{ zIndex: dateIndex + 1 }}>
              <motion.div
                className="home-z-events-date"
                initial={{ opacity: 0.3, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.35 }}
              >
                <div className="home-z-events-date-count mono">
                  {String(dateIndex + 1).padStart(2, '0')} / {String(byDate.length).padStart(2, '0')}
                </div>
                <div className="serif">{date}</div>
                <div className="home-z-events-weekday mono">{weekday}</div>
              </motion.div>
              <div className="home-z-events-list">
                {items.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Link to={`/events/${event.id}`} className="home-z-event-item">
                      <div className="home-z-event-image ph-img">
                        {event.image ? <img src={event.image} alt={l(event.title)} /> : <div className="ph-label">[ {l(event.title)} ]</div>}
                      </div>
                      <div className="home-z-event-main">
                        <div className="home-z-event-time mono">
                          <span>{event.time}</span>
                          <span>{l(event.hall)}</span>
                        </div>
                        <h3 className="serif">{l(event.title)}</h3>
                        <p>{l(event.description).slice(0, 140)}</p>
                      </div>
                      <div className="home-z-event-meta">
                        <div>{l(event.tag)}</div>
                        <div>{lang === 'ru' ? 'Билет' : 'Ticket'} {l(event.price)}</div>
                        <span>{lang === 'ru' ? 'Подробнее' : 'Details'}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="home-empty">
            {lang === 'ru' ? 'Календарь скоро появится.' : 'Calendar will be available soon.'}
          </div>
        )}
      </motion.section>

      <motion.section className="home-z-visit" {...riseIn}>
        <div className="home-z-visit-copy">
          <h2 className="serif">{lang === 'ru' ? 'Спланировать визит' : 'Plan your visit'}</h2>
          <p>
            {lang === 'ru'
              ? 'Большая Дмитровка, 1. Исторический центр Москвы, несколько минут от метро Охотный Ряд и Театральная. Приходите заранее: фойе, архитектура и залы работают как часть впечатления.'
              : 'Bolshaya Dmitrovka, 1. Historic Moscow center, minutes from Okhotny Ryad and Teatralnaya. Arrive early: the foyer, architecture and halls are part of the experience.'}
          </p>
          <div className="home-z-visit-actions">
            <Link to="/contacts" className="btn solid">{lang === 'ru' ? 'Как добраться' : 'Get directions'}</Link>
            <Link to="/events" className="btn">{lang === 'ru' ? 'Купить билет' : 'Buy ticket'}</Link>
          </div>
        </div>
        <div className="home-z-visit-panel">
          <span className="mono">{lang === 'ru' ? 'Адрес' : 'Address'}</span>
          <strong>{lang === 'ru' ? 'Москва, Большая Дмитровка 1' : 'Moscow, Bolshaya Dmitrovka 1'}</strong>
          <span className="mono">{lang === 'ru' ? 'Навигация' : 'Navigation'}</span>
          <strong>{lang === 'ru' ? 'Охотный Ряд / Театральная' : 'Okhotny Ryad / Teatralnaya'}</strong>
        </div>
      </motion.section>

      <motion.section className="home-z-halls" {...riseIn}>
        <div className="home-z-head">
          <h2 className="serif">{lang === 'ru' ? 'Залы и пространства' : 'Halls and spaces'}</h2>
          <div className="home-z-halls-nav">
            <button type="button" className="home-z-page-btn" onClick={prevHall} disabled={!canSlideHalls} aria-label={lang === 'ru' ? 'Предыдущий зал' : 'Previous hall'}>
              {lang === 'ru' ? 'Назад' : 'Prev'}
            </button>
            <button type="button" className="home-z-page-btn" onClick={nextHall} disabled={!canSlideHalls} aria-label={lang === 'ru' ? 'Следующий зал' : 'Next hall'}>
              {lang === 'ru' ? 'Далее' : 'Next'}
            </button>
            <Link to="/halls" className="btn">{lang === 'ru' ? 'Подробнее' : 'Learn more'}</Link>
          </div>
        </div>

        {currentHall ? (
          <motion.div
            key={currentHall.id}
            className="home-z-halls-main"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="home-z-hall-image ph-img">
              {currentHall.image ? (
                <img src={currentHall.image} alt={l(currentHall.name)} />
              ) : (
                <div className="ph-label">[ {l(currentHall.name)} ]</div>
              )}
            </div>
            <div className="home-z-hall-copy">
              <h3 className="serif">{l(currentHall.name)}</h3>
              <p>{l(currentHall.description)}</p>
              <Link to="/halls" className="btn">{lang === 'ru' ? 'Подробнее' : 'Details'}</Link>
            </div>
          </motion.div>
        ) : (
          <div className="home-empty">
            {lang === 'ru' ? 'Информация о залах появится скоро.' : 'Hall details will appear soon.'}
          </div>
        )}

        <div className="home-z-halls-thumbs">
          {hallCards.map((hall, i) => {
            const fallbackNames = lang === 'ru'
              ? ['Колонный зал', 'Октябрьский зал', 'Малый зал']
              : ['Hall of Columns', 'October Hall', 'Small Hall'];
            return (
              <button
                type="button"
                key={hall.id}
                className={`home-z-hall-thumb${i === activeHall ? ' active' : ''}`}
                onClick={() => setActiveHall(i)}
                aria-label={`${lang === 'ru' ? 'Открыть зал' : 'Open hall'} ${i + 1}`}
              >
                {l(hall.name) || fallbackNames[i] || `${lang === 'ru' ? 'Зал' : 'Hall'} ${i + 1}`}
              </button>
            );
          })}
        </div>
      </motion.section>

      <motion.section className="home-z-news" {...riseIn}>
        <div className="home-z-head">
          <h2 className="serif">{lang === 'ru' ? 'Новости' : 'News'}</h2>
          <Link to="/news" className="btn">{lang === 'ru' ? 'Смотреть всё' : 'See all'}</Link>
        </div>

        <div className="home-z-news-grid">
          {chronicles.length > 0 ? (
            chronicles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link to={`/news/${article.id}`} className="home-z-news-item">
                  <div className="home-z-news-date mono">{l(article.tag)}</div>
                  <h3 className="serif">{l(article.title)}</h3>
                  <div className="home-z-news-image ph-img">
                    {article.image ? <img src={article.image} alt={l(article.title)} /> : <div className="ph-label">[ {l(article.title)} ]</div>}
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="home-empty">
              {lang === 'ru' ? 'Новости скоро появятся.' : 'News will be published soon.'}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section className="home-z-about" {...riseIn}>
        <h3 className="serif">{lang === 'ru' ? 'Музыка в сердце столицы' : 'Music in the heart of the city'}</h3>
        <p>{lang === 'ru' ? 'Более 500 музыкальных событий разных форматов ежегодно' : 'Over 500 music events of different formats every year'}</p>
        <div className="home-z-about-stats">
          <div>
            <span className="mono">{lang === 'ru' ? 'мероприятий' : 'events'}</span>
            <strong>{events.length || 500}+</strong>
          </div>
          <div>
            <span className="mono">{lang === 'ru' ? 'новостей' : 'news'}</span>
            <strong>{news.length || 40}+</strong>
          </div>
          <div>
            <span className="mono">{lang === 'ru' ? 'зала' : 'halls'}</span>
            <strong>{halls.length || 2}</strong>
          </div>
        </div>
      </motion.section>

      <motion.section className="home-z-location" {...riseIn}>
        <div className="home-z-location-overlay" />
        <div className="home-z-location-content">
          <h3 className="serif">{lang === 'ru' ? 'Где мы находимся' : 'Where to find us'}</h3>
          <p>{lang === 'ru' ? 'Москва, Большая Дмитровка 1 · метро Охотный Ряд / Театральная' : 'Moscow, Bolshaya Dmitrovka 1 · Okhotny Ryad / Teatralnaya'}</p>
          <div className="home-z-location-actions">
            <Link to="/contacts" className="btn solid">{lang === 'ru' ? 'Как добраться' : 'Get directions'}</Link>
            <Link to="/about" className="btn">{lang === 'ru' ? 'О Доме' : 'About'}</Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
