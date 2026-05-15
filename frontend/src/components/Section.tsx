import type { ReactNode } from 'react';

/**
 * Единая сквозная сетка сайта.
 *
 * ВСЕ секции главной обязаны использовать <Section> или <Container>.
 * Это гарантирует, что левая/правая кромка контента совпадает сверху донизу —
 * та самая вертикальная направляющая, на которой держится «музейная» аккуратность.
 *
 * Правила:
 *  - потолок ширины: 1600px, центрируется на больших экранах;
 *  - поля от края экрана: 20px (моб) → 32px (планшет) → 48px (десктоп);
 *  - вертикальный ритм задаётся пропом `spacing`, а не произвольными py-* в секциях.
 */

const MAXW = 'max-w-[1800px]';
/* На мобайле остаются небольшие поля, на десктопе контент занимает 95% ширины. */
const PADX = 'px-5 md:px-6';

type Tone = 'paper' | 'paper-soft' | 'ink' | 'transparent';

const TONE_BG: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  'paper-soft': 'bg-paper-soft text-ink',
  ink: 'bg-ink text-paper',
  transparent: '',
};

type Spacing = 'sm' | 'md' | 'lg' | 'none';

const SPACING_Y: Record<Spacing, string> = {
  none: 'py-0',
  sm: 'py-14 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-28 md:py-40',
};

/* ------------------------------------------------------------------ */
/* Container — только горизонтальная сетка (потолок + поля).           */
/* Используется внутри полноширинных секций с фоновым медиа.           */
/* ------------------------------------------------------------------ */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full md:w-[95%] ${MAXW} ${PADX} ${className}`}>{children}</div>
  );
}

/* ------------------------------------------------------------------ */
/* Section — полноширнный фон + контент по единой сетке внутри.        */
/* `bleed` = true → контент тоже на всю ширину (без потолка),          */
/* нужно для медиа-секций (герой, история).                            */
/* ------------------------------------------------------------------ */
export function Section({
  children,
  tone = 'paper',
  spacing = 'md',
  bleed = false,
  bordered = false,
  className = '',
  as: Tag = 'section',
  id,
}: {
  children: ReactNode;
  tone?: Tone;
  spacing?: Spacing;
  bleed?: boolean;
  bordered?: boolean;
  className?: string;
  as?: 'section' | 'div';
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={[
        'relative w-full',
        TONE_BG[tone],
        bordered ? 'border-b border-line' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {bleed ? (
        <div className={SPACING_Y[spacing]}>{children}</div>
      ) : (
        <div className={`mx-auto w-full md:w-[95%] ${MAXW} ${PADX} ${SPACING_Y[spacing]}`}>
          {children}
        </div>
      )}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* KickerRow — линия 40px + точка 6px + метка (Часть 1.4 спецификации). */
/* ------------------------------------------------------------------ */
export function KickerRow({
  children,
  tone = 'dark-on-light',
  className = '',
}: {
  children: ReactNode;
  tone?: 'dark-on-light' | 'light-on-dark';
  className?: string;
}) {
  const kickerColor = tone === 'light-on-dark' ? 'text-paper/55' : 'text-muted';
  return (
    <div className={`mb-4 flex min-w-0 items-center gap-3 ${className}`}>
      <span className="inline-block h-px w-10 shrink-0 bg-accent md:w-[40px]" aria-hidden />
      <span className="inline-block size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      <div
        className={`flex min-w-0 flex-wrap items-center gap-x-1 text-[10px] font-bold uppercase tracking-[0.22em] ${kickerColor}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHead — единый блок «кикер + заголовок + ссылка».             */
/* Выровнен по той же левой направляющей, что и весь контент секции.   */
/* ------------------------------------------------------------------ */
export function SectionHead({
  kicker,
  title,
  action,
  tone = 'dark-on-light',
  className = '',
}: {
  kicker: string;
  title: ReactNode;
  action?: ReactNode;
  tone?: 'dark-on-light' | 'light-on-dark';
  className?: string;
}) {
  const titleColor = tone === 'light-on-dark' ? 'text-paper' : 'text-ink';

  return (
    <div
      className={`mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div>
        <KickerRow tone={tone}>{kicker}</KickerRow>
        <h2
          className={`font-heading text-[clamp(40px,6vw,104px)] font-bold uppercase leading-[0.9] tracking-[0.02em] ${titleColor}`}
        >
          {title}
        </h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}