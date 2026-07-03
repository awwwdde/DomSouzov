import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';
import ActionButton from '../components/ActionButton';
import { useReducedMotionActive } from '../lib/motion';

/* Авто-слайдер фото зала: перелистывает кадры каждые 6 секунд с плавным
   переходом. Прозрачные стрелки — для ручного переключения (сбрасывают
   таймер). Один кадр — без листания; нет фото — подпись-заглушка. */
function HallSlider({ images, alt, fallbackLabel }: { images: string[]; alt: string; fallbackLabel: string }) {
  const reduced = useReducedMotionActive();
  const valid = images.filter(Boolean);
  const [idx, setIdx] = useState(0);
  // Меняется при ручном переключении — перезапускает интервал автолистания.
  const [manualTick, setManualTick] = useState(0);

  useEffect(() => {
    if (reduced || valid.length < 2) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % valid.length), 6000);
    return () => window.clearInterval(id);
  }, [reduced, valid.length, manualTick]);

  const go = (dir: 1 | -1) => {
    setIdx((i) => (i + dir + valid.length) % valid.length);
    setManualTick((n) => n + 1);
  };

  if (valid.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
        {fallbackLabel}
      </div>
    );
  }

  return (
    <>
      {valid.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={i === idx ? alt : ''}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-ds"
          style={{ opacity: i === idx ? 1 : 0 }}
          aria-hidden={i !== idx}
        />
      ))}
      {valid.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Предыдущее фото"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/20 text-2xl leading-none text-paper backdrop-blur-sm transition hover:bg-ink/45 focus-visible:bg-ink/45"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Следующее фото"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/20 text-2xl leading-none text-paper backdrop-blur-sm transition hover:bg-ink/45 focus-visible:bg-ink/45"
          >
            <span aria-hidden>→</span>
          </button>
        </>
      ) : null}
    </>
  );
}

export default function Halls() {
  const { lang, content, t } = useSite();
  const halls = content?.halls ?? [];
  const title = t('halls_title') || (lang === 'ru' ? 'Залы' : 'Halls');
  const lead = t('halls_lead') || (lang === 'ru'
    ? 'Два исторических зала. Коринфские колонны и пять хрустальных люстр в главном — камерная плотность в Октябрьском. Каждый зал доступен для мероприятий.'
    : 'Two historic halls. Corinthian columns and five crystal chandeliers in the principal; chamber intimacy in the October. Each hall is available for events.');

  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  return (
    <>
      <Seo title={`${title} — Дом Союзов`} description={lead} path="halls" lang={lang} keywords={['аренда зала', 'Колонный зал', 'Октябрьский зал', 'вместимость']} />
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Залы' : 'Home · Halls'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {title}
          </h1>
        </div>
        <div className="flex flex-col items-start gap-6 self-end md:items-end">
          <ActionButton
            to="/organizers"
            text={lang === 'ru' ? 'Залы и условия' : 'Halls & terms'}
            backgroundColor="#0a0a0a"
            textColor="#f0ebe0"
          />
        </div>
      </RevealSection>

      <RevealList className="px-5 md:px-12">
        {halls.map((hall, i) => (
          <RevealItem key={hall.id}>
            <article className="grid grid-cols-1 gap-0 border-b border-line md:grid-cols-2">
              <div
                className={`relative aspect-[4/3] w-full min-w-0 overflow-hidden bg-paper-soft md:min-h-[360px] ${
                  i % 2 === 1 ? 'md:order-2' : ''
                }`}
              >
                <HallSlider
                  images={hall.gallery && hall.gallery.length ? hall.gallery : hall.image ? [hall.image] : []}
                  alt={l(hall.name)}
                  fallbackLabel={l(hall.name)}
                />
              </div>

              <div
                className={`flex flex-col justify-center border-line bg-paper p-8 md:p-12 lg:p-16 ${
                  i % 2 === 1 ? 'md:order-1 md:border-r' : 'md:border-l'
                }`}
              >
                <h2 className="font-heading text-[clamp(36px,5vw,84px)] font-bold uppercase leading-[0.92] tracking-[0.03em] text-ink">
                  {l(hall.name)}
                </h2>
                <dl className="mt-8 space-y-2 text-sm text-ink-soft">
                  <div className="flex gap-2">
                    <dt className="min-w-[10rem] text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      {lang === 'ru' ? 'Вместимость' : 'Capacity'}
                    </dt>
                    <dd>{hall.capacity}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="min-w-[10rem] text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      {lang === 'ru' ? 'Площадь' : 'Area'}
                    </dt>
                    <dd>{hall.area}</dd>
                  </div>
                </dl>
                <p className="mt-6 max-w-prose text-sm leading-7 text-ink-soft">{l(hall.description)}</p>

                {hall.features_list && hall.features_list.length > 0 ? (
                  <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
                    {hall.features_list.map((f, fi) => {
                      const ttl = l(f.title);
                      const txt = l(f.text);
                      if (!ttl && !txt) return null;
                      return (
                        <div key={fi} className="flex flex-col gap-1">
                          {ttl ? (
                            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">{ttl}</dt>
                          ) : null}
                          {txt ? <dd className="text-sm leading-6 text-ink-soft">{txt}</dd> : null}
                        </div>
                      );
                    })}
                  </dl>
                ) : null}
                <div className="mt-10">
                  <Link
                    to="/organizers"
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink transition hover:underline hover:underline-offset-4"
                  >
                    {lang === 'ru' ? 'Подробнее о зале' : 'More about the hall'}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealList>
    </>
  );
}
