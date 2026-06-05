import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATION, EASE_DS, useReducedMotionActive } from '../lib/motion';
import { getLenis } from './SmoothScrollProvider';

/** Жёсткий сброс скролла наверх, синхронизированный с Lenis.
 *  Порядок важен: сперва двигаем Lenis к 0 (resize → scrollTo), и только
 *  потом нативный scrollTo(0) — он «последнее слово», иначе lenis.resize()
 *  возвращает прежний animatedScroll в окно (desync window≠lenis). */
function resetScroll() {
  const lenis = getLenis();
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(0, { immediate: true, force: true });
  }
  window.scrollTo(0, 0);
}

/** Сбрасывает скролл в момент монтирования новой страницы.
 *  Рендерится ВНУТРИ keyed-блока, поэтому с `AnimatePresence mode="wait"`
 *  срабатывает строго после размонтирования предыдущей страницы. */
function ScrollToTop() {
  useLayoutEffect(() => {
    // Сразу + на кадрах + таймерами: Lenis/scroll-anchoring могут вернуть
    // позицию, пока верхний контент дорастает. Финальный сброс — в
    // onAnimationComplete родительского motion.div (после exit/enter).
    resetScroll();
    const r1 = requestAnimationFrame(() => {
      resetScroll();
      requestAnimationFrame(resetScroll);
    });
    const t1 = window.setTimeout(resetScroll, 60);
    const t2 = window.setTimeout(resetScroll, 200);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  return null;
}

export function PageAnimationLayout() {
  const location = useLocation();
  const reduced = useReducedMotionActive();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="flex min-h-0 w-full flex-1 flex-col"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -10 }}
        transition={{ duration: reduced ? 0 : DURATION.fast, ease: EASE_DS }}
        onAnimationComplete={resetScroll}
      >
        <ScrollToTop />
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
