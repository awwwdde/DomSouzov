import { motion } from 'framer-motion';
import type { Partner } from '../types';
import { RevealItem, RevealList } from './Reveal';
import { Section } from './Section';
import { useReducedMotionActive } from '../lib/motion';

type Props = {
  partners: Partner[];
  lang: 'ru' | 'en';
};

export default function PartnersSection({ partners, lang }: Props) {
  const reduced = useReducedMotionActive();
  const l = (obj: { ru: string; en: string }) => obj[lang] || obj.ru;

  const rows = [...partners]
    .filter((p) => p.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (rows.length === 0) return null;

  return (
    <Section tone="paper" spacing="md" className="border-t border-line">
      <div className="mb-12 md:mb-16">
        <h2 className="font-heading text-[clamp(36px,4.5vw,72px)] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink">
          {lang === 'ru' ? 'Наши партнёры' : 'Our partners'}
        </h2>
      </div>

      {/* Чистая сетка: только логотипы, без рамок и заливок. */}
      {/* 2 ряда на десктопе: 6 колонок × 2 = до 12 партнёров.       */}
      <RevealList className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 md:grid-cols-4 md:gap-x-12 md:gap-y-16 lg:grid-cols-6">
        {rows.map((p) => (
          <RevealItem key={p.id} y={12} className="will-change-transform">
            <PartnerItem partner={p} label={l(p.name)} reduced={reduced} />
          </RevealItem>
        ))}
      </RevealList>
    </Section>
  );
}

/* ----------------------------------------------------------------- */
/* PartnerItem — голый логотип без карточки.                          */
/* При наведении лого становится контрастным; клик ведёт на сайт.    */
/* ----------------------------------------------------------------- */
function PartnerItem({
  partner,
  label,
  reduced,
}: {
  partner: Partner;
  label: string;
  reduced: boolean;
}) {
  const href = partner.url?.trim();

  const logo = (
    <div className="flex h-20 w-full items-center justify-center md:h-24">
      {partner.logo ? (
        <motion.img
          src={partner.logo}
          alt={label}
          className="max-h-full max-w-[80%] object-contain"
          initial={false}
          animate={{
            opacity: reduced ? 1 : 0.7,
            filter: reduced ? 'grayscale(0)' : 'grayscale(1)',
          }}
          whileHover={
            reduced ? undefined : { opacity: 1, filter: 'grayscale(0)' }
          }
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <span className="font-heading text-[clamp(13px,1.1vw,17px)] font-bold uppercase tracking-[0.06em] text-ink">
          {label}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer"
        aria-label={label}
        title={label}
      >
        {logo}
      </a>
    );
  }
  return logo;
}
