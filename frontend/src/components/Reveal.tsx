import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  DURATION,
  EASE_DS,
  STAGGER,
  maskLineReveal,
  transitionBase,
  useInViewFailsafe,
  useReducedMotionActive,
} from '../lib/motion';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

const viewport = { once: true, amount: 0.18 } as const;

function itemVariants(reduced: boolean, y: number) {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : y },
    show: { opacity: 1, y: 0 },
  };
}

export default function Reveal({ children, delay = 0, y = 18, className }: RevealProps) {
  const reduced = useReducedMotionActive();
  const { ref, show } = useInViewFailsafe<HTMLDivElement>(viewport.amount);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={itemVariants(reduced, y)}
      transition={reduced ? { duration: 0 } : { ...transitionBase, delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealSection({ children, delay = 0, y = 22, className }: RevealProps) {
  const reduced = useReducedMotionActive();
  const { ref, show } = useInViewFailsafe<HTMLElement>(viewport.amount);
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={itemVariants(reduced, y)}
      transition={reduced ? { duration: 0 } : { ...transitionBase, delay }}
    >
      {children}
    </motion.section>
  );
}

export function RevealList({ children, className }: Pick<RevealProps, 'children' | 'className'>) {
  const reduced = useReducedMotionActive();
  const { ref, show } = useInViewFailsafe<HTMLDivElement>(viewport.amount);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduced ? 0 : STAGGER.base,
            delayChildren: reduced ? 0 : STAGGER.tight,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 18 }: RevealProps) {
  const reduced = useReducedMotionActive();
  return (
    <motion.div
      className={className}
      variants={itemVariants(reduced, y)}
      transition={reduced ? { duration: 0 } : transitionBase}
    >
      {children}
    </motion.div>
  );
}

type RevealTextProps = {
  lines: string[];
  as?: keyof typeof motionComponents;
  className?: string;
  lineClassName?: string;
  stagger?: number;
  delay?: number;
};

const motionComponents = {
  div: motion.div,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const;

export function RevealText({
  lines,
  as = 'div',
  className,
  lineClassName,
  stagger = STAGGER.base,
  delay = 0,
}: RevealTextProps) {
  const reduced = useReducedMotionActive();
  const Parent = motionComponents[as] ?? motion.div;
  const { ref, show } = useInViewFailsafe<HTMLDivElement>(viewport.amount);

  return (
    <Parent
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
    >
      {lines.map((line, i) => (
        <motion.span
          key={`${i}-${line}`}
          variants={maskLineReveal(reduced, 'up')}
          transition={reduced ? { duration: 0 } : transitionBase}
          className={['block overflow-hidden', lineClassName].filter(Boolean).join(' ')}
        >
          {line}
        </motion.span>
      ))}
    </Parent>
  );
}

type RevealMaskProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down';
};

export function RevealMask({ children, className, delay = 0, direction = 'up' }: RevealMaskProps) {
  const reduced = useReducedMotionActive();
  const { ref, show } = useInViewFailsafe<HTMLDivElement>(viewport.amount);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={maskLineReveal(reduced, direction)}
      transition={reduced ? { duration: 0 } : { ...transitionBase, delay }}
    >
      {children}
    </motion.div>
  );
}

type ParallaxProps = {
  children: ReactNode;
  speed?: number;
  className?: string;
};

export function Parallax({ children, speed = 0.15, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionActive();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

type HighlightSegment = { text: string; accent?: boolean };

type HighlightOnViewProps = {
  segments: HighlightSegment[];
  className?: string;
};

export function HighlightOnView({ segments, className }: HighlightOnViewProps) {
  const reduced = useReducedMotionActive();

  return (
    <p className={className}>
      {segments.map((seg, i) => {
        if (seg.accent) {
          return (
            <motion.span
              key={i}
              className="inline text-inherit"
              initial={reduced ? { color: '#0a0a0a' } : { color: '#4a4a45' }}
              whileInView={reduced ? undefined : { color: '#0a0a0a' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: DURATION.base, ease: EASE_DS, delay: 0.12 + i * 0.04 }
              }
            >
              {seg.text}
            </motion.span>
          );
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </p>
  );
}
