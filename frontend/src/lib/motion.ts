import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { isVisionEnabledSync } from '../context/VisionModeContext';

export const EASE_DS = [0.22, 1, 0.36, 1] as const;

export const DURATION = { fast: 0.5, base: 0.9, slow: 1.2 } as const;

export const STAGGER = { tight: 0.06, base: 0.1, loose: 0.16 } as const;

export const transitionBase = { duration: DURATION.base, ease: EASE_DS };

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

/** Vision Mode включён (читает data-vision на <html>). */
export function useVisionMode(): boolean {
  const [vision, setVision] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.dataset.vision === 'true' : false
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const sync = () => setVision(root.dataset.vision === 'true');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-vision'] });
    const onVis = () => sync();
    window.addEventListener('vision-settings-changed', onVis);
    return () => {
      observer.disconnect();
      window.removeEventListener('vision-settings-changed', onVis);
    };
  }, []);

  return vision;
}

function visionAnimationsDisabled(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.documentElement.dataset.vision !== 'true') return false;
  return document.documentElement.dataset.visionNoAnimations !== 'false';
}

/** Reduced motion: система, или Vision Mode с отключёнными анимациями (по умолчанию так). */
export function useReducedMotionActive(): boolean {
  const prefers = usePrefersReducedMotion();
  const [animOff, setAnimOff] = useState(() => visionAnimationsDisabled());

  useEffect(() => {
    const sync = () => setAnimOff(visionAnimationsDisabled());
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-vision', 'data-vision-no-animations'],
    });
    window.addEventListener('vision-settings-changed', sync);
    return () => {
      obs.disconnect();
      window.removeEventListener('vision-settings-changed', sync);
    };
  }, []);

  return prefers || animOff;
}

/** Для прелоадера: системный reduce или уже включённая версия для слабовидящих. */
export function isReducedMotionEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return isVisionEnabledSync();
}

/** Надёжная замена `whileInView`: появляется, когда элемент во вьюпорте,
 *  НО гарантированно проявляется через `failsafeMs`, даже если
 *  IntersectionObserver не сработал (баг Lenis + SPA-переход → пустые секции).
 *  Возвращает ref и флаг `show`. Используйте: initial="hidden" animate={show?'show':'hidden'}. */
export function useInViewFailsafe<T extends Element = HTMLElement>(
  amount: number = 0.18,
  failsafeMs: number = 600,
): { ref: React.RefObject<T>; show: boolean } {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount });
  const [failsafe, setFailsafe] = useState(false);

  useEffect(() => {
    if (inView) return;
    const id = window.setTimeout(() => setFailsafe(true), failsafeMs);
    return () => window.clearTimeout(id);
  }, [inView, failsafeMs]);

  return { ref, show: inView || failsafe };
}

export function fadeUp(reduced: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: { opacity: 1, y: 0 },
  };
}

export function fadeIn(reduced: boolean): Variants {
  return {
    hidden: { opacity: reduced ? 1 : 0 },
    show: { opacity: 1 },
  };
}

export function maskUp(reduced: boolean): Variants {
  return {
    hidden: { clipPath: reduced ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)' },
    show: { clipPath: 'inset(0 0 0 0)' },
  };
}

/** Маска-шторка: снизу вверх (`up`) или сверху вниз (`down`). */
export function maskLineReveal(reduced: boolean, direction: 'up' | 'down' = 'up'): Variants {
  if (reduced) {
    return {
      hidden: { clipPath: 'inset(0 0 0 0)', opacity: 1 },
      show: { clipPath: 'inset(0 0 0 0)', opacity: 1 },
    };
  }
  if (direction === 'down') {
    return {
      hidden: { clipPath: 'inset(0 0 100% 0)' },
      show: { clipPath: 'inset(0 0 0 0)' },
    };
  }
  return maskUp(reduced);
}

export function staggerParent(reduced: boolean, step: number = STAGGER.base): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : step,
      },
    },
  };
}
