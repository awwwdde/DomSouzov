/* ============================================================ */
/* Общие стили админки — светлый минимал + зелёный акцент.       */
/* Импортируй эти строки в страницах, чтобы поля, кнопки и        */
/* карточки выглядели одинаково и ровно во всём разделе.         */
/* ============================================================ */

/** Поверхность-карточка (белая, тонкая рамка, мягкая тень). */
export const card =
  'rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]';

/** Текстовое поле ввода. */
export const input =
  'min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/15';

/** Многострочное поле. */
export const textarea =
  'w-full rounded-lg border border-zinc-200 bg-white p-3.5 text-[15px] leading-relaxed text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/15';

/** Подпись поля. */
export const label =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500';

/** Основная кнопка (зелёная). */
export const btnPrimary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-[13px] font-semibold text-white transition hover:bg-accent-deep focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50';

/** Вторичная кнопка (контурная). */
export const btnGhost =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50';

/** Кнопка удаления/опасного действия. */
export const btnDanger =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50';

/** Маленькая кнопка в строках таблицы. */
export const btnSm =
  'inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 transition hover:bg-zinc-50';

export const btnSmDanger =
  'inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50';

/** Строка-переключатель (чекбокс + подпись). */
export const checkRow =
  'flex cursor-pointer select-none items-center gap-2.5 text-[13px] font-medium text-zinc-700';

/** Класс чекбокса. */
export const checkbox = 'h-4 w-4 rounded accent-accent';

/** Обёртка «шапка страницы»: маленький kicker + заголовок. */
export const pageTitle =
  'font-heading text-[clamp(30px,4vw,44px)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-zinc-900';

export const pageKicker =
  'text-[11px] font-semibold uppercase tracking-[0.16em] text-accent';
