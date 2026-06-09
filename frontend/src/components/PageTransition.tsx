import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE_DS, useReducedMotionActive } from '../lib/motion';
import { scrollToTopInstant } from './SmoothScrollProvider';

/** Сброс скролла наверх при монтировании новой страницы (окно + Lenis).
 *  Дублирует сброс из SmoothScrollProvider на случай различий в тайминге. */
function ScrollToTop() {
  useLayoutEffect(() => {
    scrollToTopInstant();
    // на следующем кадре повторяем — высота новой страницы уже посчитана
    const r = requestAnimationFrame(scrollToTopInstant);
    return () => cancelAnimationFrame(r);
  }, []);
  return null;
}

/** Простой переход: новая страница монтируется СРАЗУ (key=pathname),
 *  только плавное проявление по opacity. Никакого mode="wait" (он мог
 *  «зависать» — старая уходила, новая не монтировалась → пустая страница)
 *  и никакого transform (контент не уезжает). */
export function PageAnimationLayout() {
  const location = useLocation();
  const reduced = useReducedMotionActive();

  return (
    <motion.div
      key={location.pathname}
      className="flex min-h-0 w-full flex-1 flex-col"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.28, ease: EASE_DS }}
    >
      <ScrollToTop />
      <Outlet />
    </motion.div>
  );
}
