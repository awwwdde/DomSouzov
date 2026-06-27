import { useMemo } from 'react';
import { Section } from './Section';
import Seo from './Seo';
import { PageKicker } from './PageKicker';

/* ============================================================ */
/* LegalDocument — единый аккуратный шаблон правовых страниц     */
/* (Политика конфиденциальности, Согласие на ПДн, Соглашение).   */
/*                                                              */
/* Принимает «сырой» текст из админки и раскладывает его:        */
/*  • заголовки разделов (короткая строка без точки в конце      */
/*    или вида «1. …», «1.1 …») — крупнее, капсом;               */
/*  • остальное — читаемые абзацы в комфортной мере (~75 знаков).*/
/* ============================================================ */

type Block = { kind: 'heading' | 'text'; text: string };

/** Короткая одиночная строка без завершающей пунктуации — это заголовок раздела. */
function isHeading(block: string): boolean {
  if (block.includes('\n')) return false;
  if (block.length > 90) return false;
  const trimmed = block.trim();
  if (/[.!?…:,;»]$/.test(trimmed)) return false;
  return true;
}

function parseBlocks(text: string): Block[] {
  return text
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => ({ kind: isHeading(b) ? 'heading' : 'text', text: b }) as Block);
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
  /** Маленькая надпись над заголовком. */
  kicker?: string;
  /** Дата последнего обновления (необязательно). */
  updated?: string;
}) {
  const blocks = useMemo(() => parseBlocks(body), [body]);

  return (
    <Section spacing="md" bordered>
      <Seo title={`${title} — Дом Союзов`} path={path} lang={lang} noindex />

      {/* Шапка документа */}
      <header className="border-b border-line pb-8 md:pb-10">
        <PageKicker>{kicker || (lang === 'ru' ? 'Правовая информация' : 'Legal')}</PageKicker>
        <h1 className="font-heading text-[clamp(36px,6vw,88px)] font-bold uppercase leading-[0.9] tracking-[0.02em] text-ink">
          {title}
        </h1>
        {updated ? (
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
            {lang === 'ru' ? 'Обновлено: ' : 'Updated: '}
            {updated}
          </p>
        ) : null}
      </header>

      {/* Тело документа — комфортная мера чтения */}
      <div className="mt-10 max-w-[75ch] md:mt-12">
        {blocks.map((b, i) =>
          b.kind === 'heading' ? (
            <h2
              key={i}
              className="mt-10 font-heading text-[clamp(19px,2.2vw,28px)] font-bold uppercase leading-[1.15] tracking-[0.02em] text-ink first:mt-0"
            >
              {b.text}
            </h2>
          ) : (
            <p
              key={i}
              className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-ink-soft md:text-base md:leading-8"
            >
              {b.text}
            </p>
          )
        )}
      </div>
    </Section>
  );
}
