import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATION, EASE_DS, useReducedMotionActive } from '../lib/motion';

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
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
