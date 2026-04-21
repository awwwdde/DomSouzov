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
    <div className="ticker">
      {items.map((item, i) => (
        <span key={i} className="ticker-item mono">
          {i > 0 && <span className="dot" />}
          {item}
        </span>
      ))}
    </div>
  );
}
