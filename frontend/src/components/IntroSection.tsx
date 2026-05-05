import { useSite } from '../context/SiteContext';

export default function IntroSection() {
  const { lang, t } = useSite();

  const facts = [
    { number: t('fact1_number'), label: t('fact1_label_ru') },
    { number: t('fact2_number'), label: t('fact2_label_ru') },
    { number: t('fact3_number'), label: t('fact3_label_ru') },
  ];

  return (
    <section className="grid gap-8 px-6 md:grid-cols-[0.8fr_1.2fr] md:px-12">
      <div>
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{lang === 'ru' ? 'О месте' : 'About'}</div>
        <h2 className="font-heading text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">{t('intro_heading_ru')}</h2>
      </div>
      <div>
        <p className="text-lg leading-8 text-ink-soft">{t('intro_p1_ru')}</p>
        <p className="mt-5 text-lg leading-8 text-ink-soft">{t('intro_p2_ru')}</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {facts.map((f, i) => (
            <div key={i} className="border-t border-line pt-4">
              <strong className="font-heading text-5xl font-semibold leading-none">{f.number}</strong>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
