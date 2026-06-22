import { RefreshCw } from 'lucide-react';
import { useSite } from '../context/SiteContext';

/** Плашка «не удалось загрузить контент» с кнопкой повторить.
 *  Показывается, когда запрос /content упал (бэкенд/сеть недоступны). */
export default function NetworkError() {
  const { lang, refresh, loading } = useSite();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-5 text-center">
      <h1 className="font-heading text-[clamp(28px,5vw,56px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
        {lang === 'ru' ? 'Не удалось загрузить' : 'Failed to load'}
      </h1>
      <p className="max-w-md text-base leading-7 text-ink-soft">
        {lang === 'ru'
          ? 'Сайт временно недоступен. Проверьте соединение и попробуйте ещё раз.'
          : 'The site is temporarily unavailable. Check your connection and try again.'}
      </p>
      <button
        type="button"
        onClick={refresh}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition hover:bg-accent hover:border-accent disabled:opacity-60"
      >
        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        {lang === 'ru' ? 'Повторить' : 'Retry'}
      </button>
    </div>
  );
}
