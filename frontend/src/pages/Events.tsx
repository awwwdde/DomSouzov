import { useSite } from '../context/SiteContext';
import UpcomingEventsCalendar from '../components/UpcomingEventsCalendar';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';
import { SkeletonCards } from '../components/Skeleton';

export default function Events() {
  const { lang, content, t, loading } = useSite();
  const allEvents = content?.events ?? [];
  const title = t('events_title') || (lang === 'ru' ? 'Афиша' : 'Programme');
  const lead = t('events_lead') || (lang === 'ru'
    ? 'Концерты, литературные вечера, камерные программы и хоровая музыка. Полная афиша Дома Союзов — в Колонном и Октябрьском залах.'
    : 'Concerts, literary evenings, chamber programmes and choral music. Full programme across the Hall of Columns and October Hall.');

  return (
    <>
      <Seo title={`${title} — Дом Союзов`} description={lead} path="events" lang={lang} />
      <RevealSection className="border-b border-line bg-paper px-5 pb-14 pt-28 md:px-12 md:pb-16 md:pt-32">
        <PageKicker>{lang === 'ru' ? 'Главная · Мероприятия' : 'Home · Events'}</PageKicker>
        <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">{title}</h1>
      </RevealSection>

      {loading && allEvents.length === 0 ? (
        <SkeletonCards count={6} />
      ) : (
        <UpcomingEventsCalendar events={allEvents} lang={lang} variant="full" />
      )}
    </>
  );
}
