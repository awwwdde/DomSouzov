import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { adminApi } from '../../api/client';
import { imageMarkdown } from '../../lib/richText';

/* ================================================================ */
/* RichTextArea — обычная textarea + кнопка «Фото в текст».           */
/* Загружает файл и вставляет markdown-картинку `![](url)` на месте    */
/* курсора. На странице такая строка рендерится как изображение        */
/* (см. lib/richText + NewsDetail/EventDetail).                        */
/* ================================================================ */
export default function RichTextArea({
  value,
  onChange,
  rows = 8,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);

  const insertAtCursor = (snippet: string) => {
    const el = ref.current;
    const cur = value ?? '';
    if (!el) {
      onChange((cur ? `${cur}\n\n` : '') + snippet);
      return;
    }
    const start = el.selectionStart ?? cur.length;
    const end = el.selectionEnd ?? cur.length;
    const before = cur.slice(0, start);
    const after = cur.slice(end);
    // Картинка должна быть на своей строке — добавляем переносы, если нужно.
    const pad = (s: string, side: 'before' | 'after') => {
      if (!s) return '';
      const nl = side === 'before' ? s.endsWith('\n\n') : s.startsWith('\n');
      if (nl) return '';
      if (side === 'before') return s.endsWith('\n') ? '\n' : '\n\n';
      return '\n\n';
    };
    const lead = pad(before, 'before');
    const trail = pad(after, 'after');
    onChange(before + lead + snippet + trail + after);
    requestAnimationFrame(() => {
      el.focus();
      const pos = (before + lead + snippet).length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      insertAtCursor(imageMarkdown(url));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
      />
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-ink">
        <ImagePlus size={14} />
        {busy ? 'Загрузка…' : 'Фото в текст'}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>
    </div>
  );
}
