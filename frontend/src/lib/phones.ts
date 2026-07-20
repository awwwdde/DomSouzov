import { useSite } from '../context/SiteContext';

/** Один телефон: необязательная подпись («Приёмная», «Касса») + номер. */
export type PhoneEntry = { label: string; number: string };

/** Сырой элемент списка `phones` из админки (ListEditor). */
type RawPhone = { label?: unknown; number?: unknown };

/**
 * Телефоны сайта. Источник — список `phones` из админки (сколько угодно
 * номеров, каждый с подписью). Если список пуст, откатываемся на одиночную
 * настройку `phone`, чтобы старые сайты продолжали работать без правок.
 */
export function usePhones(): PhoneEntry[] {
  const { list, pickItem, t } = useSite();

  const many = list<RawPhone>('phones', [])
    .map((p) => ({ label: pickItem(p, 'label'), number: pickItem(p, 'number').trim() }))
    .filter((p) => p.number);

  if (many.length > 0) return many;

  const single = (t('phone') || '').trim();
  return single ? [{ label: '', number: single }] : [];
}

/**
 * Номер для атрибута href="tel:". Оставляем только цифры и ведущий «+»,
 * иначе пробелы, скобки и дефисы ломают набор на части устройств.
 */
export function telHref(number: string): string {
  const cleaned = number.replace(/[^\d+]/g, '');
  return `tel:${cleaned.startsWith('+') ? '+' : ''}${cleaned.replace(/\+/g, '')}`;
}
