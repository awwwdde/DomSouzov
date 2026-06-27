import { useMemo } from 'react';
import { Section } from './Section';
import Seo from './Seo';
import { PageKicker } from './PageKicker';

/* ============================================================ */
/* LegalDocument — единый аккуратный шаблон правовых страниц     */
/* (Политика конфиденциальности, Согласие на ПДн, Соглашение).   */
/*                                                              */
/* Текст из админки разбирается ПОСТРОЧНО (юр. документы обычно  */
/* идут строка-в-строку, без пустых строк между пунктами):       */
/*  • «Раздел N …» — заголовок раздела (+ якорь и оглавление);    */
/*  • короткая строка с двоеточием («3.1. … :») — подзаголовок;  */
/*  • «1) …», «2) …» — нумерованные пункты с отступом;           */
/*  • остальное — обычные абзацы.                               */
/* Слева — липкое оглавление по разделам.                        */
/* ============================================================ */

type Kind = 'h1' | 'h2' | 'li' | 'text';
type Block = { kind: Kind; text: string; marker?: string; id: string };

// \b не работает после кириллицы в JS-regex — требуем пробел/точку/цифру после слова.
const SECTION_RE = /^(раздел|глава|статья|приложение|часть|section|article|chapter|part|appendix|clause)[\s.\d]/i;
const LIST_RE = /^(\d+)\)\s*(.*)$/;

function classify(line: string): { kind: Kind; text: string; marker?: string } {
  const t = line.trim();
  if (SECTION_RE.test(t)) return { kind: 'h1', text: t };
  const li = t.match(LIST_RE);
  if (li) return { kind: 'li', text: li[2], marker: `${li[1]})` };
  // Короткая строка-«вводка» перед перечислением: «3.1. Оператор обязан:».
  if (t.length <= 90 && /:$/.test(t)) return { kind: 'h2', text: t };
  // Короткий самостоятельный заголовок без завершающей пунктуации.
  if (t.length <= 70 && !/[.!?…,;»)]$/.test(t)) return { kind: 'h2', text: t };
  return { kind: 'text', text: t };
}

function parseBlocks(text: string): Block[] {
  const out: Block[] = [];
  let i = 0;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const c = classify(raw.replace(/\t/g, ' '));
    out.push({ ...c, id: `sec-${i}` });
    i += 1;
  }
  return out;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LegalDocument({
  title,
  body,
  path,
  lang,
  kicker,
  updated,
}: {
  title: string;
  body: string;
  path: string;
  lang: 'ru' | 'en';
  kicker?: string;
  updated?: string;
}) {
  const blocks = useMemo(() => parseBlocks(body), [body]);
  const sections = useMemo(() => blocks.filter((b) => b.kind === 'h1'), [blocks]);
  const hasToc = sections.length >= 2;

  return (
    <Section spacing="md" bordered>
      <Seo title={`${title} — Дом Союзов`} path={path} lang={lang} noindex />

      {/* Шапка документа */}
      <header className="border-b border-line pb-8 md:pb-10">
        <PageKicker>{kicker || (lang === 'ru' ? 'Правовая информация' : 'Legal')}</PageKicker>
        <h1 className="font-heading text-[clamp(30px,5vw,76px)] font-bold uppercase leading-[0.92] tracking-[0.02em] text-ink">
          {title}
        </h1>
        {updated ? (
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Обновлено: ' : 'Updated: '}
            {updated}
          </p>
        ) : null}
      </header>

      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-12">
        {/* Оглавление (липкое на десктопе) */}
        {hasToc ? (
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="md:sticky md:top-28">
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                {lang === 'ru' ? 'Содержание' : 'Contents'}
              </div>
              <nav className="grid gap-1 border-l border-line">
                {sections.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => scrollToId(h.id)}
                    className="-ml-px border-l-2 border-transparent py-1 pl-4 text-left text-[13px] leading-snug text-ink-soft transition hover:border-accent hover:text-ink"
                  >
                    {h.text.replace(/:$/, '')}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        ) : null}

        {/* Тело документа */}
        <div className={hasToc ? 'md:col-span-8 lg:col-span-9' : 'md:col-span-12'}>
          <div className="max-w-[900px]">
            {blocks.map((b) => {
              if (b.kind === 'h1') {
                return (
                  <h2
                    key={b.id}
                    id={b.id}
                    className="mt-14 scroll-mt-28 font-heading text-[clamp(20px,2.2vw,30px)] font-bold uppercase leading-[1.15] tracking-[0.02em] text-ink first:mt-0"
                  >
                    {b.text}
                  </h2>
                );
              }
              if (b.kind === 'h2') {
                return (
                  <h3 key={b.id} className="mt-8 text-[16px] font-bold leading-7 text-ink md:text-[17px]">
                    {b.text}
                  </h3>
                );
              }
              if (b.kind === 'li') {
                return (
                  <div key={b.id} className="mt-2 flex gap-3 pl-1">
                    <span className="shrink-0 font-semibold tabular-nums text-accent">{b.marker}</span>
                    <span className="text-[15px] leading-7 text-ink-soft md:text-base md:leading-8">{b.text}</span>
                  </div>
                );
              }
              return (
                <p
                  key={b.id}
                  className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-ink-soft md:text-base md:leading-8"
                >
                  {b.text}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
