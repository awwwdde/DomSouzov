import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

/* ============================================================ */
/* Analytics — Яндекс.Метрика и Google Analytics из CMS.       */
/* ID задаются в админке (Настройки → Аналитика):              */
/*   analytics_yandex_metrika — номер счётчика Метрики;        */
/*   analytics_ga_id          — Measurement ID GA (G-XXXX).    */
/* Скрипты грузятся только если ID заданы. Трекинг SPA-         */
/* переходов — на смене маршрута.                              */
/* ============================================================ */

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function Analytics() {
  const { t } = useSite();
  const location = useLocation();
  const ym = (t('analytics_yandex_metrika') || '').trim();
  const ga = (t('analytics_ga_id') || '').trim();
  const ymReady = useRef(false);
  const gaReady = useRef(false);

  // Инициализация Яндекс.Метрики (один раз).
  useEffect(() => {
    if (!ym || ymReady.current) return;
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
  }, [ym]);

  // Инициализация Google Analytics (один раз).
  useEffect(() => {
    if (!ga || gaReady.current) return;
    gaReady.current = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', ga, { send_page_view: false });
  }, [ga]);

  // Трекинг переходов SPA.
  useEffect(() => {
    const url = location.pathname + location.search;
    if (ym && window.ym) window.ym(Number(ym), 'hit', url);
    if (ga && window.gtag) window.gtag('event', 'page_view', { page_path: url });
  }, [location.pathname, location.search, ym, ga]);

  return null;
}
