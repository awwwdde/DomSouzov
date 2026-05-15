import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { isVisionEnabledSync } from '../context/VisionModeContext';
import {
  DURATION,
  EASE_DS,
  fadeUp,
  fadeIn,
  transitionBase,
  isReducedMotionEnvironment,
  useReducedMotionActive,
} from '../lib/motion';

type PreloaderProps = {
  onComplete: () => void;
};

export default function Preloader({ onComplete }: PreloaderProps) {
  const reduced = useReducedMotionActive();
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }, [onComplete]);

  useLayoutEffect(() => {
    if (isVisionEnabledSync() || isReducedMotionEnvironment()) {
      finish();
    }
  }, [finish]);

  useEffect(() => {
    if (isVisionEnabledSync() || isReducedMotionEnvironment()) return;
    const delay = reduced ? 0 : 2400;
    const id = window.setTimeout(() => setPhase('exit'), delay);
    return () => window.clearTimeout(id);
  }, [reduced]);

  if (isVisionEnabledSync() || isReducedMotionEnvironment()) {
    return null;
  }

  const handleExitComplete = () => {
    if (phase === 'exit') finish();
  };

  const overlay = (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink"
      aria-hidden
      initial={{ opacity: 1 }}
      animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: phase === 'exit' ? (reduced ? 0 : DURATION.slow) : 0, ease: EASE_DS }}
      onAnimationComplete={handleExitComplete}
    >
      <div className="flex flex-col items-center gap-8 px-6">
        <motion.h1
          className="text-center font-heading text-[clamp(28px,6vw,52px)] font-bold uppercase tracking-[0.28em] text-white"
          variants={fadeUp(reduced)}
          initial="hidden"
          animate={phase === 'exit' ? 'hidden' : 'show'}
          transition={reduced ? { duration: 0 } : transitionBase}
        >
          Дом Союзов
        </motion.h1>
        <motion.div
          className="h-px w-[min(280px,70vw)] origin-left bg-white/55"
          initial={{ scaleX: 0 }}
          animate={phase === 'exit' ? { scaleX: 1 } : { scaleX: 1 }}
          transition={reduced ? { duration: 0 } : { ...transitionBase, delay: 0.12 }}
        />
        <motion.p
          className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55"
          variants={fadeIn(reduced)}
          initial="hidden"
          animate={phase === 'exit' ? 'hidden' : 'show'}
          transition={reduced ? { duration: 0 } : { ...transitionBase, delay: 0.28 }}
        >
          Москва · с 1784 года
        </motion.p>
      </div>
    </motion.div>
  );

  if (typeof document === 'undefined') {
    return overlay;
  }

  return createPortal(overlay, document.body);
}
