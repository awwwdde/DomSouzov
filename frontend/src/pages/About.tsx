import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import { RevealItem, RevealList, RevealSection } from '../components/Reveal';

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
      <RevealSection className="grid gap-8 border-b border-line bg-paper px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-16 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · О Доме' : 'Home · About'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">{lang === 'ru' ? 'О Доме Союзов' : 'About the House'}</h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">
          {lang === 'ru'
            ? 'Памятник классицизма конца XVIII века, перестроенный Матвеем Казаковым. Колонный зал — 28 коринфских колонн, одна из лучших акустик Москвы.'
            : 'Late 18th-century classicist landmark, rebuilt by Matvey Kazakov. The Hall of Columns — 28 Corinthian columns, among Moscow\'s finest acoustics.'}
        </p>
      </RevealSection>

      <RevealSection className="grid gap-8 px-5 py-16 md:grid-cols-[1fr_1.2fr] md:px-12">
        <div className="min-h-[360px] border border-line bg-paper-soft">
          <div className="flex h-full items-center justify-center p-8 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted">[ {lang === 'ru' ? 'ИСТОРИЧЕСКОЕ ФОТО · 1800-е' : 'HISTORICAL PHOTO · 1800s'} ]</div>
        </div>
        <div className="max-w-3xl">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Хроника здания' : 'Chronicle'}
          </div>
          <p className="text-xl leading-9 text-ink-soft">
            {lang === 'ru'
              ? 'Здание возведено в конце XVIII века как дворянское собрание. В 1784 году архитектор Матвей Казаков перестраивает его, объединяя анфиладу парадных залов и создавая главный зал с двумя рядами коринфских колонн.'
              : 'The building was erected in the late 18th century as the Assembly of the Nobility. In 1784, architect Matvey Kazakov rebuilt it, joining the enfilade of formal rooms and creating the principal hall with two rows of Corinthian columns.'}
          </p>
          <p className="mt-5 text-xl leading-9 text-ink-soft">
            {lang === 'ru'
              ? 'Колонный зал стал одной из важнейших концертных площадок Российской империи: здесь выступали Чайковский, Лист, Рахманинов, звучали премьеры.'
              : 'The Hall of Columns became one of the most important concert venues of the Russian Empire: Tchaikovsky, Liszt, and Rachmaninoff performed here; premieres resounded within its walls.'}
          </p>
          <p className="mt-5 text-xl leading-9 text-ink-soft">
            {lang === 'ru'
              ? 'Сегодня Дом Союзов — действующая культурная площадка: афиша концертов, лекций и торжественных мероприятий.'
              : 'Today the House of Unions is a working cultural venue: a programme of concerts, lectures and ceremonies.'}
          </p>
        </div>
      </RevealSection>

      <RevealSection className="border-t border-line px-5 py-16 md:px-12">
        <h2 className="mb-6 font-heading text-[clamp(48px,6vw,96px)] font-bold uppercase leading-[0.86] tracking-[0.04em]">{lang === 'ru' ? 'Хронология' : 'Timeline'}</h2>
        <RevealList className="grid">
          {tl.map((item) => (
            <RevealItem key={item.year}>
              <div className="grid gap-4 border-t border-line py-5 md:grid-cols-[120px_1fr_2fr]">
                <div className="font-heading text-5xl font-semibold leading-none">{item.year}</div>
                <div className="font-semibold">{item.event}</div>
                <div className="leading-7 text-ink-soft">{item.desc}</div>
              </div>
            </RevealItem>
          ))}
        </RevealList>
      </RevealSection>
    </>
  );
}
