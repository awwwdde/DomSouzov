import HeroA from '../components/HeroA';
import Ticker from '../components/Ticker';
import IntroSection from '../components/IntroSection';
import EventsC from '../components/EventsC';
import NewsSection from '../components/NewsSection';
import HallsPreview from '../components/HallsPreview';

export default function Home() {
  return (
    <>
      <HeroA />
      <Ticker />
      <IntroSection />
      <EventsC />
      <NewsSection />
      <HallsPreview />
    </>
  );
}
