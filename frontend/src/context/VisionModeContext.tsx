import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const VISION_STORAGE_KEY = 'domsouzov-vision-settings';

export type VisionFontSize = 'normal' | 'large' | 'xlarge';
export type VisionColorScheme = 'bw' | 'wb' | 'bb' | 'by';
export type VisionLineSpacing = 'normal' | 'increased';

export interface VisionSettings {
  enabled: boolean;
  fontSize: VisionFontSize;
  colorScheme: VisionColorScheme;
  lineSpacing: VisionLineSpacing;
  noImages: boolean;
  noAnimations: boolean;
}

export const DEFAULT_VISION_SETTINGS: VisionSettings = {
  enabled: false,
  fontSize: 'normal',
  colorScheme: 'bw',
  lineSpacing: 'normal',
  noImages: false,
  noAnimations: true,
};

type VisionModeContextValue = {
  settings: VisionSettings;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  updateSettings: (partial: Partial<VisionSettings>) => void;
  resetSettings: () => void;
};

const VisionModeContext = createContext<VisionModeContextValue | null>(null);

function migrateRaw(raw: string | null): VisionSettings {
  if (!raw) return { ...DEFAULT_VISION_SETTINGS };
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    // Старый формат Header: { enabled, font, theme: light|dark }
    if ('font' in p && !('fontSize' in p)) {
      const oldFont = p.font as string;
      const oldTheme = p.theme as string;
      return {
        ...DEFAULT_VISION_SETTINGS,
        enabled: Boolean(p.enabled),
        fontSize:
          oldFont === 'xlarge' ? 'xlarge' : oldFont === 'large' ? 'large' : 'normal',
        colorScheme: oldTheme === 'dark' ? 'wb' : 'bw',
        noAnimations: DEFAULT_VISION_SETTINGS.noAnimations,
      };
    }
    return {
      ...DEFAULT_VISION_SETTINGS,
      ...p,
      enabled: Boolean(p.enabled ?? DEFAULT_VISION_SETTINGS.enabled),
      fontSize: (p.fontSize as VisionFontSize) ?? DEFAULT_VISION_SETTINGS.fontSize,
      colorScheme: (p.colorScheme as VisionColorScheme) ?? DEFAULT_VISION_SETTINGS.colorScheme,
      lineSpacing:
        (p.lineSpacing as VisionLineSpacing) ?? DEFAULT_VISION_SETTINGS.lineSpacing,
      noImages: Boolean(p.noImages ?? DEFAULT_VISION_SETTINGS.noImages),
      noAnimations:
        p.noAnimations !== undefined
          ? Boolean(p.noAnimations)
          : DEFAULT_VISION_SETTINGS.noAnimations,
    };
  } catch {
    return { ...DEFAULT_VISION_SETTINGS };
  }
}

function writeHtmlDataset(s: VisionSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.vision = s.enabled ? 'true' : 'false';
  if (!s.enabled) {
    delete root.dataset.visionFont;
    delete root.dataset.visionTheme;
    delete root.dataset.visionLine;
    delete root.dataset.visionNoImages;
    delete root.dataset.visionNoAnimations;
    return;
  }
  root.dataset.visionFont =
    s.fontSize === 'xlarge' ? 'xlarge' : s.fontSize === 'large' ? 'large' : 'normal';
  root.dataset.visionTheme = s.colorScheme;
  root.dataset.visionLine = s.lineSpacing;
  if (s.noImages) root.dataset.visionNoImages = 'true';
  else delete root.dataset.visionNoImages;
  if (s.noAnimations) root.dataset.visionNoAnimations = 'true';
  else root.dataset.visionNoAnimations = 'false';
}

export function readVisionSettingsFromStorage(): VisionSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_VISION_SETTINGS };
  return migrateRaw(window.localStorage.getItem(VISION_STORAGE_KEY));
}

/** Синхронно: нужен для пропуска прелоадера до гидрации React. */
export function isVisionEnabledSync(): boolean {
  try {
    return readVisionSettingsFromStorage().enabled === true;
  } catch {
    return false;
  }
}

export function VisionModeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VisionSettings>(() => readVisionSettingsFromStorage());
  const [panelOpen, setPanelOpen] = useState(false);

  const persistStorage = useCallback((next: VisionSettings) => {
    try {
      window.localStorage.setItem(VISION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event('vision-settings-changed'));
  }, []);

  useLayoutEffect(() => {
    writeHtmlDataset(settings);
  }, [settings]);

  useEffect(() => {
    persistStorage(settings);
  }, [settings, persistStorage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('vision') === 'on') {
      setSettings((prev) => ({ ...prev, enabled: true, noAnimations: true }));
      params.delete('vision');
      const q = params.toString();
      const path = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', path);
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<VisionSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      if (partial.enabled === true && !prev.enabled) {
        next.noAnimations = true;
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_VISION_SETTINGS });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      panelOpen,
      setPanelOpen,
      updateSettings,
      resetSettings,
    }),
    [settings, panelOpen, updateSettings, resetSettings]
  );

  return <VisionModeContext.Provider value={value}>{children}</VisionModeContext.Provider>;
}

export function useVisionModeContext() {
  const ctx = useContext(VisionModeContext);
  if (!ctx) throw new Error('useVisionModeContext requires VisionModeProvider');
  return ctx;
}
