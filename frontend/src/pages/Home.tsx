import { Link } from 'react-router-dom';
import ActionButton from '../components/ActionButton';
import Marquee from '../components/Marquee';
import UpcomingEventsCalendar from '../components/UpcomingEventsCalendar';
import { useSite } from '../context/SiteContext';

export default function Home() {
  const { lang, content, t } = useSite();
  const events = content?.events ?? [];
  const news = content?.news ?? [];
  const heroVideo = t('hero_video_url');
  const heroPoster = t('hero_video_poster');

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;
  const heroRailEvents = events.slice(0, 3);
  const latestNews = news[0] ?? null;
  const marqueeItems = lang === 'ru'
    ? ['Мероприятия', 'Концерты', 'Собрания', 'Форумы', 'Конференции', 'Торжественные вечера', 'Культурные события', 'Приемы']
    : ['Events', 'Concerts', 'Meetings', 'Forums', 'Conferences', 'Ceremonial evenings', 'Cultural events', 'Receptions'];
  return (
    <div className="grid gap-14 pb-10 md:gap-20">
      <section className="relative h-dvh min-h-dvh overflow-hidden">
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
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-500 to-slate-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

        <div className="absolute inset-0 grid items-end gap-6 p-6 md:grid-cols-[1fr_minmax(280px,360px)] md:p-12">
          <div className="max-w-2xl text-white">
            <div aria-label={lang === 'ru' ? 'Описание площадки' : 'Venue description'}>
              {lang === 'ru' ? (
                <>
                  <span className="block max-w-md font-heading text-[clamp(22px,2.4vw,38px)] font-medium uppercase leading-[1.02] tracking-[-0.01em]">Дом Союзов оживает каждый раз, когда открываются двери перед началом события.</span>
                </>
              ) : (
                <>
                  <span className="block max-w-md font-heading text-[clamp(22px,2.4vw,38px)] font-medium uppercase leading-[1.02] tracking-[-0.01em]">House of Unions comes alive every time the doors open before the show.</span>
                </>
              )}
            </div>
          </div>

          <aside className="relative z-10 rounded-3xl border border-white/20 bg-black/25 p-3 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">{lang === 'ru' ? 'Будущие мероприятия' : 'Upcoming events'}</span>
              <Link to="/events" className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-90 transition hover:opacity-100">
                {lang === 'ru' ? 'Все' : 'All'}
              </Link>
            </div>
            {heroRailEvents.length > 0 ? (
              <div className="grid gap-2">
                {heroRailEvents.map((event) => (
                  <Link to={`/events/${event.id}`} className="grid grid-cols-[86px_1fr] items-center gap-3 rounded-2xl border border-white/15 bg-white/15 p-2 transition duration-200 ease-ds hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/25" key={event.id}>
                    <div className="aspect-[16/10] overflow-hidden rounded-xl bg-white/15">
                      {event.image ? (
                        <img className="h-full w-full object-cover" src={event.image} alt={l(event.title)} />
                      ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-[0.12em] text-white/70">[ {l(event.title)} ]</div>
                      )}
                    </div>
                    <div className="grid gap-1">
                      <strong className="text-sm font-semibold leading-tight">{l(event.title)}</strong>
                      <span className="text-[11px] text-white/80">{l(event.date)} · {event.time}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white/15 p-4 text-sm text-white/85">{lang === 'ru' ? 'События скоро появятся.' : 'Events will be added soon.'}</div>
            )}
          </aside>
        </div>
      </section>

      <section className="grid min-h-[35vh] place-items-center px-6 py-14 text-center md:px-12 md:py-20">
        <div className="mx-auto grid max-w-5xl justify-items-center gap-5">
          <p className="font-heading text-[clamp(32px,4.8vw,76px)] font-medium uppercase leading-[0.98] tracking-[-0.03em] text-ink">
            {lang === 'ru'
              ? 'Дом Союзов - историческое пространство Москвы, где проходят концерты, форумы, выставки и торжественные события.'
              : 'House of Unions is a historic Moscow venue hosting concerts, forums, exhibitions, and ceremonial events.'}
          </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ActionButton
            to="/events"
            text={lang === 'ru' ? 'Афиша' : 'Programme'}
            backgroundColor="#181818"
            textColor="#ffffff"
            strokeColor="#181818"
          />
          <ActionButton
            to="/organizers"
            text={lang === 'ru' ? 'Организаторам' : 'For organizers'}
            backgroundColor="transparent"
            textColor="#181818"
            strokeColor="#181818"
          />
        </div>

        <div className="flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-1 text-xs leading-5 text-ink-soft">
          <span>{lang === 'ru' ? 'Пн-Сб: 08:00-23:00' : 'Mon-Sat: 08:00-23:00'}</span>
          <span>{lang === 'ru' ? 'Воскресенье: выходной' : 'Sunday: closed'}</span>
          <span>
            {lang === 'ru'
              ? 'Билеты продаются на сайтах партнеров и официальных билетных сервисах.'
              : 'Tickets are sold via partner websites and official ticket platforms.'}
          </span>
          <span>{lang === 'ru' ? `Справки: ${t('phone')}` : `Info: ${t('phone')}`}</span>
        </div>
        </div>
      </section>

      <Marquee
        items={marqueeItems}
        ariaLabel={lang === 'ru' ? 'Форматы событий' : 'Event formats'}
      />

      <UpcomingEventsCalendar events={events} lang={lang} />

      <section className="flex flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-12">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{lang === 'ru' ? 'Новости Дома Союзов' : 'House news'}</span>
          <h3 className="mt-3 max-w-5xl font-heading text-[clamp(38px,5vw,72px)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
            {latestNews ? l(latestNews.title) : (lang === 'ru' ? 'Скоро здесь появятся актуальные новости и анонсы.' : 'Latest news and announcements will appear here soon.')}
          </h3>
          {latestNews ? <p className="mt-4 max-w-3xl leading-7 text-ink-soft">{l(latestNews.excerpt)}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton to="/news" text={lang === 'ru' ? 'Читать новости' : 'Read news'} backgroundColor="#181818" textColor="#ffffff" strokeColor="#181818" />
          <ActionButton to="/contacts" text={lang === 'ru' ? 'Контакты' : 'Contacts'} backgroundColor="transparent" textColor="#181818" strokeColor="#181818" />
        </div>
      </section>
    </div>
  );
}
