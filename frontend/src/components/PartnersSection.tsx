import { motion } from 'framer-motion';
import type { Partner } from '../types';
import { RevealItem, RevealList } from './Reveal';
import { useReducedMotionActive } from '../lib/motion';

type Props = {
  partners: Partner[];
  lang: 'ru' | 'en';
};

export default function PartnersSection({ partners, lang }: Props) {
  const reduced = useReducedMotionActive();
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  const rows = [...partners].filter((p) => p.is_active !== false).sort((a, b) => a.sort_order - b.sort_order);

  if (rows.length === 0) return null;

  return (
    <section className="border-t border-line bg-paper px-5 py-16 md:px-12 md:py-24">
      <div className="mb-10 flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-accent" aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          {lang === 'ru' ? 'Партнёры' : 'Partners'}
        </span>
      </div>
      <RevealList className="flex flex-wrap items-center justify-start gap-x-10 gap-y-12 md:gap-x-16 md:gap-y-14">
        {rows.map((p) => (
          <RevealItem key={p.id} y={12} className="will-change-transform">
            <PartnerLogo partner={p} label={l(p.name)} reduced={reduced} />
          </RevealItem>
        ))}
      </RevealList>
    </section>
  );
}

function PartnerLogo({ partner, label, reduced }: { partner: Partner; label: string; reduced: boolean }) {
  const href = partner.url?.trim();
  const inner = (
    <motion.div
      className="flex h-14 w-[min(160px,40vw)] items-center justify-center md:h-16 md:w-[180px]"
      whileHover={reduced ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={label}
          className={[
            'max-h-full max-w-full object-contain transition duration-500 ease-ds',
            reduced ? 'opacity-100 grayscale-0' : 'opacity-55 grayscale hover:opacity-100 hover:grayscale-0',
          ].join(' ')}
        />
      ) : (
        <span className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}
