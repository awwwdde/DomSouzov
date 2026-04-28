import { useSite } from '../context/SiteContext';

const TIMELINE = {
  ru: [
    { year: '1784', event: 'Перестройка Казаковым', desc: 'Матвей Казаков создаёт Колонный зал — 28 коринфских колонн, белый мрамор, пять хрустальных люстр.' },
    { year: '1844', event: 'Выступление Ференца Листа', desc: 'Один из первых знаменитых гастрольных концертов зала.' },
    { year: '1891', event: 'П. И. Чайковский', desc: 'Композитор многократно дирижирует собственными произведениями.' },
    { year: '1930', event: 'Переход к профсоюзам', desc: 'Здание получает современное имя «Дом Союзов».' },
    { year: '2024', event: 'Реставрация', desc: 'Современная реставрация с сохранением исторической акустики.' },
  ],
  en: [
    { year: '1784', event: "Kazakov's reconstruction", desc: 'Matvey Kazakov creates the Hall of Columns: 28 Corinthian columns, white marble, five crystal chandeliers.' },
    { year: '1844', event: "Ferenc Liszt's performance", desc: "One of the hall's first great touring concerts." },
    { year: '1891', event: 'P. I. Tchaikovsky', desc: 'The composer conducts his own works on multiple occasions.' },
    { year: '1930', event: 'Transferred to the unions', desc: "The building receives its modern name — House of Unions." },
    { year: '2024', event: 'Restoration', desc: 'Contemporary restoration preserving the historical acoustics.' },
  ],
};

export default function About() {
  const { lang } = useSite();
  const tl = TIMELINE[lang];

  return (
    <>
      <section className="page-title">
        <div>
          <div className="crumb mono">{lang === 'ru' ? 'Главная · О Доме' : 'Home · About'}</div>
          <h1 className="serif">{lang === 'ru' ? 'О Доме Союзов' : 'About the House'}</h1>
        </div>
        <p className="lede">
          {lang === 'ru'
            ? 'Памятник классицизма конца XVIII века, перестроенный Матвеем Казаковым. Колонный зал — 28 коринфских колонн, одна из лучших акустик Москвы.'
            : 'Late 18th-century classicist landmark, rebuilt by Matvey Kazakov. The Hall of Columns — 28 Corinthian columns, among Moscow\'s finest acoustics.'}
        </p>
      </section>

      <section className="about-intro">
        <div className="ph-img about-ph">
          <div className="ph-label">[ {lang === 'ru' ? 'ИСТОРИЧЕСКОЕ ФОТО · 1800-е' : 'HISTORICAL PHOTO · 1800s'} ]</div>
        </div>
        <div className="copy">
          <div className="mono about-copy-label">
            {lang === 'ru' ? 'Хроника здания' : 'Chronicle'}
          </div>
          <p className="dropcap about-copy-text">
            {lang === 'ru'
              ? 'Здание возведено в конце XVIII века как дворянское собрание. В 1784 году архитектор Матвей Казаков перестраивает его, объединяя анфиладу парадных залов и создавая главный зал с двумя рядами коринфских колонн.'
              : 'The building was erected in the late 18th century as the Assembly of the Nobility. In 1784, architect Matvey Kazakov rebuilt it, joining the enfilade of formal rooms and creating the principal hall with two rows of Corinthian columns.'}
          </p>
          <p className="about-copy-text">
            {lang === 'ru'
              ? 'Колонный зал стал одной из важнейших концертных площадок Российской империи: здесь выступали Чайковский, Лист, Рахманинов, звучали премьеры.'
              : 'The Hall of Columns became one of the most important concert venues of the Russian Empire: Tchaikovsky, Liszt, and Rachmaninoff performed here; premieres resounded within its walls.'}
          </p>
          <p className="about-copy-text">
            {lang === 'ru'
              ? 'Сегодня Дом Союзов — действующая культурная площадка: афиша концертов, лекций и торжественных мероприятий.'
              : 'Today the House of Unions is a working cultural venue: a programme of concerts, lectures and ceremonies.'}
          </p>
        </div>
      </section>

      <section className="block">
        <h2>{lang === 'ru' ? 'Хронология' : 'Timeline'}</h2>
        <div className="timeline">
          {tl.map((item) => (
            <div key={item.year} className="tl-row">
              <div className="yr serif">{item.year}</div>
              <div className="ev">{item.event}</div>
              <div className="dc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
