/** Адаптивные картинки: бэкенд отдаёт уменьшенную копию по ?w=<ширина>
 *  (и WebP при поддержке браузером) — см. serve_upload в backend/main.py.
 *
 *  imgAttrs(src, sizes) возвращает { src, srcSet, sizes } для <img>/<motion.img>:
 *  браузер сам выбирает нужную ширину под вьюпорт и DPR, вместо того чтобы
 *  тянуть оригинал (до 6000×4000). Ширины совпадают с набором, к которому
 *  бэкенд «снапит» запрос, — максимум попаданий в кэш.
 *
 *  Трогаем только свои растровые загрузки (относительные пути *.jpg/png/webp).
 *  Внешние http(s), data: и svg возвращаем как есть. */

const WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600, 1920] as const;

function canResize(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('data:')) return false;
  if (/^https?:\/\//i.test(src)) return false; // внешние — не наш /uploads
  return /\.(jpe?g|png|webp)(\?|$)/i.test(src);
}

function withWidth(src: string, w: number): string {
  const hashIdx = src.indexOf('#');
  const hash = hashIdx >= 0 ? src.slice(hashIdx) : '';
  const noHash = hashIdx >= 0 ? src.slice(0, hashIdx) : src;
  const [path, query = ''] = noHash.split('?');
  const params = new URLSearchParams(query);
  params.set('w', String(w));
  return `${path}?${params.toString()}${hash}`;
}

export type ImgAttrs = { src: string; srcSet?: string; sizes?: string };

/** Атрибуты для адаптивной картинки. `sizes` — CSS-описание ширины слота
 *  (например '100vw' или '(min-width:1024px) 33vw, 100vw'). */
export function imgAttrs(
  src: string | null | undefined,
  sizes = '100vw',
  fallbackWidth = 1024,
): ImgAttrs {
  const s = src || '';
  if (!canResize(s)) return { src: s };
  return {
    src: withWidth(s, fallbackWidth),
    srcSet: WIDTHS.map((w) => `${withWidth(s, w)} ${w}w`).join(', '),
    sizes,
  };
}
