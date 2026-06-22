import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteContent, Lang } from '../types';
import { getContent } from '../api/client';

interface SiteContextValue {
  content: SiteContent | null;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  /** Значение ТОЛЬКО для текущего языка, без подмены русским.
   *  Нужно там, где у компонента есть свой англоязычный фолбэк —
   *  иначе при пустом EN-переводе на странице протекал бы русский текст. */
  tStrict: (key: string) => string;
  /** Возвращает массив элементов, сохранённых ListEditor в админке.
   *  Каждое подполе либо строка, либо `{ru, en}`. Помощник `pickItem`
   *  достаёт значение для текущего языка.                              */
  list: <T = Record<string, unknown>>(key: string, fallback: T[]) => T[];
  /** Достаёт значение подполя элемента списка с учётом языка. */
  pickItem: (item: unknown, key: string) => string;
  loading: boolean;
  /** true, если контент не удалось загрузить (сеть/бэкенд недоступны). */
  error: boolean;
  refresh: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

const FALLBACK: SiteContent = {
  settings: {},
  events: [],
  news: [],
  halls: [],
  gallery: [],
  gallery_categories: [],
  partners: [],
  about: { hover_tips: [], scattered_photos: [], timeline: [] },
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [lang, setLang] = useState<Lang>('ru');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getContent()
      .then((data) => {
        setContent({
          ...data,
          partners: data.partners ?? [],
          gallery_categories: data.gallery_categories ?? [],
          about: data.about ?? { hover_tips: [], scattered_photos: [], timeline: [] },
        });
        setError(false);
      })
      .catch(() => {
        setContent(FALLBACK);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const t = (key: string): string => {
    if (!content) return '';
    const entry = content.settings[key];
    if (!entry) return '';
    return entry[lang] || entry['ru'] || '';
  };

  const tStrict = (key: string): string => {
    if (!content) return '';
    const entry = content.settings[key];
    if (!entry) return '';
    return entry[lang] || '';
  };

  const list = <T,>(key: string, fallback: T[]): T[] => {
    if (!content) return fallback;
    const raw = content.settings[key]?.ru;
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : fallback;
    } catch {
      return fallback;
    }
  };

  const pickItem = (item: unknown, key: string): string => {
    if (!item || typeof item !== 'object') return '';
    const v = (item as Record<string, unknown>)[key];
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      const bi = v as Record<string, string>;
      return bi[lang] || bi.ru || bi.en || '';
    }
    return String(v);
  };

  return (
    <SiteContext.Provider value={{ content, lang, setLang, t, tStrict, list, pickItem, loading, error, refresh: load }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};
