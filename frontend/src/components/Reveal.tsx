import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

const transition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1],
} as const;

const viewport = { once: true, amount: 0.18 } as const;

export default function Reveal({ children, delay = 0, y = 18, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealSection({ children, delay = 0, y = 22, className }: RevealProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.section>
  );
}

export function RevealList({ children, className }: Pick<RevealProps, 'children' | 'className'>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.07,
            delayChildren: 0.08,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 18 }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0 },
      }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
