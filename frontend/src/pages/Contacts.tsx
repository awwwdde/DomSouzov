import { useSite } from '../context/SiteContext';
import { RevealSection } from '../components/Reveal';

export default function Contacts() {
  const { lang, t } = useSite();

  return (
    <>
      <RevealSection className="grid gap-6 px-6 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'Главная · Контакты' : 'Home · Contacts'}</div>
          <h1 className="font-heading text-[clamp(64px,10vw,150px)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">{lang === 'ru' ? 'Контакты' : 'Contacts'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Билетная касса, аренда, пресс-служба, администрация — все контакты и часы работы.'
            : 'Box office, hire, press, administration — contacts and opening hours.'}
        </p>
      </RevealSection>

      <RevealSection className="grid gap-8 px-6 md:grid-cols-[1fr_1fr] md:px-12">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Расположение' : 'Location'}
          </div>
          <h2 className="font-heading text-[clamp(42px,5vw,78px)] font-semibold uppercase leading-[0.88] tracking-[-0.05em]">
            {lang === 'ru' ? 'Москва · Большая Дмитровка 1' : 'Moscow · Bolshaya Dmitrovka 1'}
          </h2>
          <dl className="mt-8 grid grid-cols-[120px_1fr] gap-x-5 gap-y-5 text-sm">
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Касса' : 'Box office'}</dt>
            <dd className="leading-6 text-ink-soft">
              {t('phone')}<br />
              <span className="text-muted">{lang === 'ru' ? 'Вт–Вс · 10:00—21:30' : 'Tue–Sun · 10:00—21:30'}</span>
            </dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Аренда' : 'Hire'}</dt>
            <dd className="leading-6 text-ink-soft">
              {t('email_rent')}<br />
              <span className="text-muted">+7 (495) 000-11-11</span>
            </dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Пресса' : 'Press'}</dt>
            <dd className="text-ink-soft">{t('email_press')}</dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Метро' : 'Metro'}</dt>
            <dd className="text-ink-soft">{t('metro_ru')}</dd>
            <dt className="font-bold uppercase tracking-[0.08em]">{lang === 'ru' ? 'Часы' : 'Hours'}</dt>
            <dd className="leading-6 text-ink-soft">
              {t('hours_ru')}<br />
              <span className="text-muted">{lang === 'ru' ? 'Понедельник — выходной' : 'Monday — closed'}</span>
            </dd>
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-ink px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">{lang === 'ru' ? 'Построить маршрут' : 'Directions'} →</button>
            <a href={`mailto:${t('email_rent')}`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-transparent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5">{lang === 'ru' ? 'Написать' : 'Email'}</a>
          </div>
        </div>
        <div>
          <div className="flex min-h-[460px] items-center justify-center rounded-2xl bg-paper p-8 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">{lang === 'ru' ? '[ КАРТА · МОСКВА ]' : '[ MAP · MOSCOW ]'}</div>
        </div>
      </RevealSection>
    </>
  );
}
