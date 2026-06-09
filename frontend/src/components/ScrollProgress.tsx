import { motion, useScroll, useSpring } from 'framer-motion';
import { useReducedMotionActive } from '../lib/motion';

/** Тонкая полоса прогресса чтения вверху страницы (зелёный акцент). */
export default function ScrollProgress() {
  const reduced = useReducedMotionActive();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });
  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[300] h-[3px] origin-left bg-accent"
    />
  );
}
