/* ============================================================ */
/* Согласие на cookies (152-ФЗ).                                */
/*                                                              */
/* Единственный источник правды о выборе пользователя. Читают:  */
/*   • CookieBanner — показывать ли баннер и что в нём отмечено; */
/*   • Analytics    — запускать ли счётчики;                    */
/*   • Footer       — кнопка «Настройки cookie» (отзыв).        */
/*                                                              */
/* Обязательные cookies нужны для работы сайта и не отключаются;*/
/* аналитические подключаются только по явному согласию.        */
/* ============================================================ */

const STORAGE_KEY = 'ds-cookies-accepted';
const CONSENT_KEY = 'ds-cookies-consent';
const EVENT = 'ds-consent-change';

export type Consent = { essential: true; analytics: boolean };

/** Выбор пользователя, либо null — если он ещё не сделан (или отозван). */
export function readConsent(): Consent | null {
  try {
    if (localStorage.getItem(STORAGE_KEY) !== '1') return null;
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    return { essential: true, analytics: parsed.analytics === true };
  } catch {
    // Приватный режим или повреждённое значение — считаем, что согласия нет.
    return null;
  }
}

export function saveConsent(consent: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    /* ignore */
  }
  notify();
}

/**
 * Отзыв согласия: стираем выбор, и баннер спрашивает заново.
 * Счётчики уже загруженные в текущей вкладке останавливаются только
 * после перезагрузки — её инициирует вызывающий код.
 */
export function revokeConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
  notify();
}

function notify() {
  window.dispatchEvent(new Event(EVENT));
}

/** Подписка на изменения выбора — в том числе из соседней вкладки. */
export function onConsentChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}
