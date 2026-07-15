import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

const STORAGE_KEY = 'ds-cookies-accepted';
const CONSENT_KEY = 'ds-cookies-consent';

/** Категории cookies. Обязательные всегда включены (нужны для работы сайта). */
type Consent = { essential: true; analytics: boolean };

function saveConsent(consent: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    /* ignore */
  }
}

export default function CookieBanner() {
  const { lang } = useSite();
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true });
    setVisible(false);
  };

  // Сохраняем выбранные галочки. Ни одной галочки → только обязательные
  // (пользователь отказывается давать данные для аналитики).
  const saveChoice = () => {
    saveConsent({ essential: true, analytics });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[190] border-t border-line bg-ink/95 px-5 py-4 text-paper backdrop-blur-md md:px-12"
      role="dialog"
      aria-live="polite"
      aria-label={lang === 'ru' ? 'Согласие на использование cookies' : 'Cookie consent'}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-paper/85">
            {lang === 'ru'
              ? 'Используем cookies для работы сайта и аналитики.'
              : 'We use cookies for site functionality and analytics.'}{' '}
            <Link to="/privacy-policy" className="font-semibold underline underline-offset-4 text-paper hover:underline hover:underline-offset-4">
              {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy policy'}
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center border border-paper/30 bg-transparent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition hover:border-paper/60"
              onClick={() => setConfiguring((v) => !v)}
              aria-expanded={configuring}
            >
              {lang === 'ru' ? 'Настроить' : 'Customise'}
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center bg-paper px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-paper/90"
              onClick={acceptAll}
            >
              {lang === 'ru' ? 'Принять все' : 'Accept all'}
            </button>
          </div>
        </div>

        {/* Панель настройки категорий */}
        {configuring ? (
          <div className="grid gap-4 border-t border-paper/15 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Обязательные — всегда включены */}
              <label className="flex items-start gap-3 rounded-lg border border-paper/15 bg-paper/5 p-3">
                <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 accent-accent" />
                <span>
                  <span className="block text-[13px] font-bold uppercase tracking-[0.1em] text-paper">
                    {lang === 'ru' ? 'Обязательные' : 'Essential'}
                  </span>
                  <span className="mt-1 block text-[12px] leading-5 text-paper/70">
                    {lang === 'ru'
                      ? 'Нужны для работы сайта — отключить нельзя.'
                      : 'Required for the site to work — cannot be disabled.'}
                  </span>
                </span>
              </label>

              {/* Аналитика — по выбору */}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-paper/15 bg-paper/5 p-3 transition hover:border-paper/30">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-accent"
                />
                <span>
                  <span className="block text-[13px] font-bold uppercase tracking-[0.1em] text-paper">
                    {lang === 'ru' ? 'Аналитика' : 'Analytics'}
                  </span>
                  <span className="mt-1 block text-[12px] leading-5 text-paper/70">
                    {lang === 'ru'
                      ? 'Помогает понять, как посетители пользуются сайтом.'
                      : 'Helps us understand how visitors use the site.'}
                  </span>
                </span>
              </label>
            </div>

            <p className="text-[12px] leading-5 text-paper/60">
              {lang === 'ru'
                ? 'Если не выбрать ни одной галочки, то вы отказываетесь давать данные — будут использованы только обязательные cookies.'
                : 'If you do not tick any box, you decline to share data — only essential cookies will be used.'}
            </p>

            <div>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center bg-accent px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition hover:bg-accent-deep"
                onClick={saveChoice}
              >
                {lang === 'ru' ? 'Сохранить выбор' : 'Save choice'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
