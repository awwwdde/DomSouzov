import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { useReducedMotionActive } from '../lib/motion';

type Props = {
  children: ReactNode;
  routeKey: string;
};

/* ============================================================ */
/* Плавный скролл на Lenis — с защитой от прошлых багов.        */
/*                                                              */
/* Что было сломано раньше и как учтено:                        */
/*  1) Контент «улетал»/пропадал при переходе — Lenis держал    */
/*     старую позицию. → Жёсткий сброс наверх при смене роута   */
/*     в правильном порядке (resize → window → scrollTo как     */
/*     «последнее слово»), + history.scrollRestoration='manual' */
/*     (в main.tsx), + переход без AnimatePresence mode="wait"  */
/*     (в PageTransition — страница монтируется сразу).         */
/*  2) Lenis перехватывал внутренний скролл меню/модалок. →     */
/*     опция prevent: элементы с [data-lenis-prevent] нативны.  */
/*  3) Тач/мобайл не трогаем (syncTouch=false) — там нативно.   */
/*  4) Reduced/слабовидящие — Lenis выключен.                   */
/* ============================================================ */

// Глобальная ссылка на активный экземпляр (для сброса из PageTransition).
let lenisInstance: Lenis | null = null;
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Надёжный сброс наверх. Порядок критичен: scrollTo(0) идёт ПОСЛЕДНИМ —
 *  иначе lenis.resize() возвращает прежний animatedScroll в окно (desync). */
export function scrollToTopInstant() {
  const lenis = lenisInstance;
  if (lenis) {
    lenis.resize();
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo(0, 0);
  }
}

export default function SmoothScrollProvider({ children, routeKey }: Props) {
  const disabled = useReducedMotionActive();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    if (disabled) {
      root.style.scrollBehavior = 'smooth';
      lenisInstance = null;
      return;
    }

    root.style.scrollBehavior = 'auto';
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // мобильный тач — нативный (перехват тача давал баги)
      wheelMultiplier: 1,
      // Не перехватывать скролл внутри меню/модалок/списков.
      prevent: (node) =>
        !!(node && typeof node.closest === 'function' && node.closest('[data-lenis-prevent]')),
    });
    lenisInstance = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lenis.destroy();
      lenisInstance = null;
      root.style.scrollBehavior = 'smooth';
    };
  }, [disabled]);

  // Жёсткий сброс наверх при смене маршрута. Страница уже смонтирована
  // (PageTransition без mode="wait"), поэтому высота корректна.
  useEffect(() => {
    scrollToTopInstant();
  }, [routeKey]);

  return <>{children}</>;
}
