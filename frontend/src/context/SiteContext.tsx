import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteContent, Lang } from '../types';
import { getContent } from '../api/client';

interface SiteContextValue {
  content: SiteContent | null;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  loading: boolean;
  refresh: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

const FALLBACK: SiteContent = {
  settings: {},
  events: [],
  news: [],
  halls: [],
  gallery: [],
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [lang, setLang] = useState<Lang>('ru');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getContent()
      .then(setContent)
      .catch(() => setContent(FALLBACK))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const t = (key: string): string => {
    if (!content) return '';
    const entry = content.settings[key];
    if (!entry) return '';
    return entry[lang] || entry['ru'] || '';
  };

  return (
    <SiteContext.Provider value={{ content, lang, setLang, t, loading, refresh: load }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};
