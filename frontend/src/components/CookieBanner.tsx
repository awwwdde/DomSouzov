import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

const STORAGE_KEY = 'ds-cookies-accepted';

export default function CookieBanner() {
  const { lang } = useSite();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[190] border-t border-line bg-ink/95 px-5 py-4 text-paper backdrop-blur-md md:px-12"
      role="dialog"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-paper/85">
          {lang === 'ru'
            ? 'Используем cookies для работы сайта и аналитики.'
            : 'We use cookies for site functionality and analytics.'}{' '}
          <Link to="/privacy-policy" className="font-semibold underline underline-offset-4 text-paper hover:text-accent">
            {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy policy'}
          </Link>
        </p>
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center justify-center bg-accent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper"
          onClick={accept}
        >
          {lang === 'ru' ? 'Принять' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
