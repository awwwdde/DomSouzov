import HeroA from '../components/HeroA';
import Ticker from '../components/Ticker';
import IntroSection from '../components/IntroSection';
import EventsC from '../components/EventsC';
import NewsSection from '../components/NewsSection';
import HallsPreview from '../components/HallsPreview';
import Reveal from '../components/Reveal';

export default function Home() {
  return (
    <>
      <Reveal y={14}>
        <HeroA />
      </Reveal>
      <Reveal delay={0.05} y={14}>
        <Ticker />
      </Reveal>
      <Reveal delay={0.08}>
        <IntroSection />
      </Reveal>
      <Reveal delay={0.1}>
        <EventsC />
      </Reveal>
      <Reveal delay={0.12}>
        <NewsSection />
      </Reveal>
      <Reveal delay={0.14}>
        <HallsPreview />
      </Reveal>
    </>
  );
}
