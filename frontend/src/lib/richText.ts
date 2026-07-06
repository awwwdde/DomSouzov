/* ================================================================ */
/* richText — простой «текст + встроенные картинки» для новостей и    */
/* афиши. Картинка задаётся markdown-строкой на отдельной строке:      */
/*   ![подпись](https://…/photo.jpg)                                   */
/* Всё остальное — обычные абзацы. Так администратор может, например,   */
/* добавить блок «партнёры мероприятия» прямо в конце текста.          */
/* ================================================================ */

export type ContentBlock =
  | { type: 'text'; value: string }
  | { type: 'image'; url: string; alt: string };

/** Строка целиком — markdown-картинка `![alt](url)`. */
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;

/** Нормализуем путь к медиа так же, как на страницах (относительный → /path). */
export function mediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

/** markdown-строка для вставки картинки в текст. */
export function imageMarkdown(url: string, alt = ''): string {
  return `![${alt}](${url})`;
}

/** Делит контент на блоки: абзацы текста и отдельные картинки. */
export function parseContentBlocks(text: string): ContentBlock[] {
  return (text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line): ContentBlock => {
      const m = line.match(IMAGE_LINE);
      if (m) return { type: 'image', url: m[2].trim(), alt: m[1].trim() };
      return { type: 'text', value: line };
    });
}

/** Первый текстовый абзац — для SEO-описания (картинки пропускаем). */
export function firstTextBlock(blocks: ContentBlock[]): string {
  const b = blocks.find((x) => x.type === 'text');
  return b && b.type === 'text' ? b.value : '';
}
