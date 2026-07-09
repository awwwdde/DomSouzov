/* ============================================================ */
/* HallStats — крупная, но «дышащая» подача цифр зала.          */
/* Из строки вида «до 1021 мест» / «954,4 м²» вытаскиваем        */
/* приставку (до), число и единицу — число крупное, приставка   */
/* и единица мелкие и приглушённые, между блоками — разделитель. */
/* ============================================================ */

type StatParts = { prefix: string; num: string; unit: string };

/** Разбивает «до 1021 мест» → {prefix:'до', num:'1021', unit:'мест'}. */
function parseStat(value?: string | null): StatParts | null {
  const v = (value || '').trim();
  if (!v) return null;
  const m = v.match(/[\d][\d\s.,]*\d|\d/); // первое число (с пробелами/запятыми внутри)
  if (!m || m.index === undefined) return { prefix: '', num: v, unit: '' };
  return {
    prefix: v.slice(0, m.index).trim(),
    num: m[0].trim(),
    unit: v.slice(m.index + m[0].length).trim(),
  };
}

function StatCell({ prefix, num, unit }: StatParts) {
  return (
    <div className="flex flex-col">
      {/* Единица сверху мелкой меткой (МЕСТ / М²) */}
      <span className="text-[11px] font-bold uppercase leading-none tracking-[0.2em] text-muted">
        {unit || ' '}
      </span>
      <span className="mt-2 flex items-baseline gap-1.5">
        {prefix ? (
          <span className="font-heading text-[clamp(15px,1.5vw,20px)] font-semibold uppercase tracking-[0.04em] text-muted">
            {prefix}
          </span>
        ) : null}
        <span className="font-heading text-[clamp(38px,4.4vw,62px)] font-bold leading-[0.9] tracking-[0.01em] tabular-nums text-ink">
          {num}
        </span>
      </span>
    </div>
  );
}

export default function HallStats({
  capacity,
  area,
  className = '',
}: {
  capacity?: string | null;
  area?: string | null;
  className?: string;
}) {
  const cells = [parseStat(capacity), parseStat(area)].filter(Boolean) as StatParts[];
  if (!cells.length) return null;
  return (
    <div className={`flex flex-wrap items-end gap-x-10 gap-y-5 sm:gap-x-14 ${className}`}>
      {cells.map((c, i) => (
        <StatCell key={i} {...c} />
      ))}
    </div>
  );
}
