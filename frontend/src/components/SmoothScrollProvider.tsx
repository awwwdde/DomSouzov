import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { useReducedMotionActive, useVisionMode } from '../lib/motion';

type Props = {
  children: ReactNode;
  routeKey: string;
};

/** Глобальная ссылка на активный Lenis — нужна для сброса скролла из
 *  PageTransition в момент фактического монтирования новой страницы.
 *  `null`, когда Lenis отключён (vision / reduced motion). */
export function getLenis(): Lenis | null {
  return (window as unknown as { __dsLenis?: Lenis | null }).__dsLenis ?? null;
}

export default function SmoothScrollProvider({ children, routeKey }: Props) {
  const reduced = useReducedMotionActive();
  const vision = useVisionMode();
  const lenisDisabled = vision || reduced;
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const w = window as unknown as { __dsLenis?: Lenis | null };
    if (lenisDisabled) {
      root.style.scrollBehavior = 'smooth';
      lenisRef.current = null;
      w.__dsLenis = null;
      return;
    }

    root.style.scrollBehavior = 'auto';
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.1,
    });
    lenisRef.current = lenis;
    w.__dsLenis = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      w.__dsLenis = null;
      root.style.scrollBehavior = 'smooth';
    };
  }, [lenisDisabled]);

  // Основной сброс скролла — в PageTransition (после монтирования страницы).
  // Здесь дублируем мгновенный сброс прямо на смене маршрута (срабатывает
  // сразу по клику, до завершения анимации перехода) + пересчёт размеров.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
  }, [routeKey]);

  return <>{children}</>;
}
