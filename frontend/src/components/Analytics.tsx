import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { readConsent, onConsentChange } from '../lib/consent';

/* ============================================================ */
/* Analytics — Яндекс.Метрика из CMS.                          */
/* ID задаётся в админке (Настройки → Аналитика):              */
/*   analytics_yandex_metrika — номер счётчика Метрики.        */
/*                                                             */
/* Скрипт грузится, только если задан ID И пользователь        */
/* согласился на аналитические cookies (152-ФЗ: до согласия    */
/* аналитику подключать нельзя). Трекинг SPA-переходов — на    */
/* смене маршрута.                                             */
/*                                                             */
/* Google Analytics удалён намеренно: он передаёт данные        */
/* посетителей за пределы РФ, что 152-ФЗ запрещает независимо  */
/* от согласия на cookies. Метрика хостится в РФ.               */
/* ============================================================ */

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  const { t } = useSite();
  const location = useLocation();
  const ym = (t('analytics_yandex_metrika') || '').trim();
  const ymReady = useRef(false);

  const [allowed, setAllowed] = useState(() => readConsent()?.analytics === true);

  // Пользователь мог согласиться уже после загрузки страницы — тогда
  // счётчик поднимается сразу, без перезагрузки.
  useEffect(() => onConsentChange(() => setAllowed(readConsent()?.analytics === true)), []);

  // Инициализация Яндекс.Метрики (один раз).
  useEffect(() => {
    if (!ym || !allowed || ymReady.current) return;
    ymReady.current = true;
    (function (m: any, e: any, t: any, r: any, i: string) {
      m[i] =
        m[i] ||
        function (...args: unknown[]) {
          (m[i].a = m[i].a || []).push(args);
        };
      m[i].l = 1 * (new Date() as unknown as number);
      const k = e.createElement(t);
      const a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym?.(Number(ym), 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
    });
  }, [ym, allowed]);

  // Трекинг переходов SPA.
  useEffect(() => {
    if (!allowed || !ym || !window.ym) return;
    window.ym(Number(ym), 'hit', location.pathname + location.search);
  }, [location.pathname, location.search, ym, allowed]);

  return null;
}
