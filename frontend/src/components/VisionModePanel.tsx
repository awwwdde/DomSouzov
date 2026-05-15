import { X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import {
  useVisionModeContext,
  type VisionColorScheme,
  type VisionFontSize,
  type VisionLineSpacing,
} from '../context/VisionModeContext';

export default function VisionModePanel({
  embedded = false,
  className = '',
}: {
  embedded?: boolean;
  className?: string;
}) {
  const { lang } = useSite();
  const { settings, updateSettings, resetSettings, setPanelOpen } = useVisionModeContext();

  const t = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  const cardClass = embedded
    ? 'rounded-none border border-line bg-white p-4 text-ink shadow-none'
    : 'fixed right-4 top-[calc(72px+12px)] z-[265] w-[min(380px,calc(100vw-32px))] border border-line bg-white p-5 shadow-lg';

  const btn = (active: boolean) =>
    [
      'min-h-11 min-w-11 rounded-full border px-3 text-center text-xs font-bold uppercase tracking-[0.12em] transition',
      active ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink/40',
    ].join(' ');

  return (
    <div className={`${cardClass} ${className}`} role="dialog" aria-modal={!embedded} aria-labelledby="vision-panel-title">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id="vision-panel-title" className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
          {t('Версия для слабовидящих', 'Vision accessibility')}
        </h2>
        {!embedded ? (
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-xl leading-none text-ink"
            onClick={() => setPanelOpen(false)}
            aria-label={t('Закрыть', 'Close')}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <label className="mb-6 flex cursor-pointer items-center gap-3 border-b border-line pb-4">
        <input
          type="checkbox"
          className="h-5 w-5 accent-accent"
          checked={settings.enabled}
          onChange={(e) => updateSettings({ enabled: e.target.checked })}
        />
        <span className="text-sm font-semibold">{t('Включить версию', 'Enable mode')}</span>
      </label>

      <div className="mb-5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          {t('Размер шрифта', 'Font size')}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['normal', t('Обычный', 'Normal')],
              ['large', t('Крупный', 'Large')],
              ['xlarge', t('Очень крупный', 'Extra large')],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={btn(settings.fontSize === key)}
              onClick={() => updateSettings({ enabled: true, fontSize: key as VisionFontSize })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          {t('Цветовая схема', 'Color scheme')}
        </div>
        <div className="grid gap-2">
          {(
            [
              ['bw', t('Чёрный на белом', 'Black on white')],
              ['wb', t('Белый на чёрном', 'White on black')],
              ['bb', t('Чёрный на бежевом', 'Black on beige')],
              ['by', t('Синий на белом', 'Blue on white')],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`${btn(settings.colorScheme === key)} w-full justify-start text-left`}
              onClick={() => updateSettings({ enabled: true, colorScheme: key as VisionColorScheme })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
          {t('Межстрочный интервал', 'Line spacing')}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={btn(settings.lineSpacing === 'normal')}
            onClick={() => updateSettings({ enabled: true, lineSpacing: 'normal' })}
          >
            {t('Стандарт', 'Standard')}
          </button>
          <button
            type="button"
            className={btn(settings.lineSpacing === 'increased')}
            onClick={() => updateSettings({ enabled: true, lineSpacing: 'increased' })}
          >
            {t('Увеличенный', 'Increased')}
          </button>
        </div>
      </div>

      <label className="mb-3 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-accent"
          checked={settings.noImages}
          onChange={(e) => updateSettings({ enabled: true, noImages: e.target.checked })}
        />
        <span className="text-sm">{t('Отключить изображения', 'Hide images')}</span>
      </label>

      <label className="mb-6 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-accent"
          checked={settings.noAnimations}
          onChange={(e) => updateSettings({ enabled: true, noAnimations: e.target.checked })}
        />
        <span className="text-sm">{t('Отключить анимации', 'Disable animations')}</span>
      </label>

      <button
        type="button"
        className="w-full border border-line bg-paper py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink transition hover:border-ink/40"
        onClick={resetSettings}
      >
        {t('Сбросить настройки', 'Reset settings')}
      </button>
    </div>
  );
}
