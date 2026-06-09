import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionActive } from '../lib/motion';

type MarqueeProps = {
  items: string[];
  ariaLabel?: string;
  duration?: number;
  className?: string;
  /** `dark` — фон ink; `accent` — фирменный зелёный фон. */
  variant?: 'light' | 'dark' | 'accent';
};

export default function Marquee({
  items,
  ariaLabel,
  duration = 28,
  className = '',
  variant = 'light',
}: MarqueeProps) {
  const reduced = useReducedMotionActive();
  const repeatedItems = [...items, ...items];
  const [hovered, setHovered] = useState(false);

  const effectiveDuration = reduced ? duration : hovered ? duration * 2.2 : duration;

  const isDark = variant === 'dark';
  const isAccent = variant === 'accent';
  const onColor = isDark || isAccent;
  const textClass = onColor
    ? 'font-heading text-[clamp(22px,3.4vw,46px)] font-bold uppercase tracking-[-0.01em] text-paper'
    : 'font-heading text-[clamp(28px,4.6vw,68px)] font-semibold uppercase leading-none tracking-[-0.04em] text-ink';
  const dotClass = onColor ? 'h-2 w-2 rounded-full bg-paper/50' : 'h-2 w-2 rounded-full bg-ink';
  const sectionTone = isAccent
    ? 'border-accent-deep bg-accent'
    : isDark
      ? 'border-paper/10 bg-ink'
      : 'border-line bg-paper';

  return (
    <section
      className={[
        'ds-marquee overflow-hidden border-y py-4',
        sectionTone,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {reduced ? (
        <div className="flex w-max items-center gap-8 whitespace-nowrap px-4">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`inline-flex items-center gap-6 ${textClass}`}
            >
              {item}
              <span className={dotClass} aria-hidden="true" />
            </span>
          ))}
        </div>
      ) : (
        <motion.div
          className="flex w-max items-center gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: effectiveDuration, ease: 'linear', repeat: Infinity }}
        >
          {repeatedItems.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`inline-flex items-center gap-6 ${textClass}`}
            >
              {item}
              <span className={dotClass} aria-hidden="true" />
            </span>
          ))}
        </motion.div>
      )}
    </section>
  );
}
