import { motion } from 'framer-motion';

type MarqueeProps = {
  items: string[];
  ariaLabel?: string;
  duration?: number;
  className?: string;
};

export default function Marquee({
  items,
  ariaLabel,
  duration = 28,
  className = '',
}: MarqueeProps) {
  const repeatedItems = [...items, ...items];

  return (
    <section
      className={['overflow-hidden border-y border-line bg-paper py-4', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <motion.div
        className="flex w-max items-center gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {repeatedItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-6 font-heading text-[clamp(28px,4.6vw,68px)] font-semibold uppercase leading-none tracking-[-0.04em] text-ink"
          >
            {item}
            <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />
          </span>
        ))}
      </motion.div>
    </section>
  );
}
