import { useSite } from '../context/SiteContext';
import './IntroSection.css';

export default function IntroSection() {
  const { lang, t } = useSite();

  const facts = [
    { number: t('fact1_number'), label: t('fact1_label_ru') },
    { number: t('fact2_number'), label: t('fact2_label_ru') },
    { number: t('fact3_number'), label: t('fact3_label_ru') },
  ];

  return (
    <section className="intro-section">
      <div className="intro-left">
        <div className="intro-label mono">{lang === 'ru' ? 'О месте' : 'About'}</div>
        <h2 className="intro-heading serif">{t('intro_heading_ru')}</h2>
      </div>
      <div className="intro-right">
        <p>{t('intro_p1_ru')}</p>
        <p>{t('intro_p2_ru')}</p>
        <div className="intro-facts">
          {facts.map((f, i) => (
            <div key={i} className="fact">
              <strong className="serif">{f.number}</strong>
              <div className="fact-label mono">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
