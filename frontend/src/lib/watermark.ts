/** Водяной знак автора сайта. Строки лежат здесь, потому что их использует
 *  и приложение (сообщение в консоли), и сборщик — плагин `watermark()`
 *  в [vite.config.ts](../../vite.config.ts) импортирует их отсюда, чтобы
 *  текст не расходился между баннером в бандле и консолью. */

export const WATERMARK_AUTHOR = 'Сделано awwwdde. 2026 Все права защищены';
export const WATERMARK_URL = 'https://t.me/awwddedev';

/** Печатает подпись автора в консоль браузера. Вызываем только в прод-сборке:
 *  в дев-режиме сообщение только мешало бы отладке. */
export function printWatermark(): void {
  if (typeof console === 'undefined') return;
  console.log(
    `%c${WATERMARK_AUTHOR}%c\n${WATERMARK_URL}`,
    'font-weight:700;font-size:13px;color:#1f5f4e',
    'font-size:12px;color:#6b7280',
  );
}
