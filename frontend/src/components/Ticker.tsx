import { useSite } from '../context/SiteContext';

const TICKERS = {
  ru: [
    'ОТКРЫТО ДЛЯ ПОСЕЩЕНИЯ · ВТ–ВС 10:00—22:00',
    'БЛИЖАЙШИЙ КОНЦЕРТ · 19.VI · ЭПОХА ВЕЛИКИХ КОМПОЗИТОРОВ',
    'КОЛОННЫЙ ЗАЛ · 28 КОРИНФСКИХ КОЛОНН · АКУСТИКА КЛАССА A',
  ],
  en: [
    'OPEN TO VISITORS · TUE–SUN 10:00—22:00',
    'UPCOMING · 19 JUN · THE AGE OF GREAT COMPOSERS',
    'HALL OF COLUMNS · 28 CORINTHIAN COLUMNS · ACOUSTIC CLASS A',
  ],
};

export default function Ticker() {
  const { lang } = useSite();
  const items = TICKERS[lang];

  return (
    <div className="flex gap-6 overflow-hidden border-y border-line py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
      {items.map((item, i) => (
        <span key={i} className="inline-flex shrink-0 items-center gap-6">
          {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-muted" />}
          {item}
        </span>
      ))}
    </div>
  );
}
