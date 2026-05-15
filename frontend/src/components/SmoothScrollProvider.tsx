import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { useReducedMotionActive, useVisionMode } from '../lib/motion';

type Props = {
  children: ReactNode;
  routeKey: string;
};

export default function SmoothScrollProvider({ children, routeKey }: Props) {
  const reduced = useReducedMotionActive();
  const vision = useVisionMode();
  const lenisDisabled = vision || reduced;
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (lenisDisabled) {
      root.style.scrollBehavior = 'smooth';
      lenisRef.current = null;
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

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      root.style.scrollBehavior = 'smooth';
    };
  }, [lenisDisabled]);

  useEffect(() => {
    if (lenisDisabled) {
      window.scrollTo(0, 0);
      return;
    }
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [routeKey, lenisDisabled]);

  return <>{children}</>;
}
