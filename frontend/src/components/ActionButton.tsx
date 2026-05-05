import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

type ActionButtonProps = {
  to: string;
  text: string;
  backgroundColor?: string;
  textColor?: string;
  strokeColor?: string;
  className?: string;
};

export default function ActionButton({
  to,
  text,
  backgroundColor = 'transparent',
  textColor = 'var(--ink)',
  strokeColor = 'currentColor',
  className = '',
}: ActionButtonProps) {
  const style = {
    '--ui-btn-bg': backgroundColor,
    '--ui-btn-color': textColor,
    '--ui-btn-stroke': strokeColor,
  } as CSSProperties;

  return (
    <Link
      to={to}
      className={[
        'inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition duration-200 ease-ds hover:-translate-y-0.5 hover:opacity-95',
        'border-[var(--ui-btn-stroke)] bg-[var(--ui-btn-bg)] text-[var(--ui-btn-color)]',
        className,
      ].filter(Boolean).join(' ')}
      style={style}
    >
      {text}
    </Link>
  );
}
