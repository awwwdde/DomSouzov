import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/client';

type SettingRow = { key: string; value_ru: string; value_en: string };

const GROUPS: { label: string; keys: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    label: 'Герой (главная страница)',
    keys: [
      { key: 'hero_kicker_ru', label: 'Кикер под логотипом (RU / EN)', multiline: false },
      { key: 'hero_subtitle_ru', label: 'Подзаголовок героя (RU / EN)' },
      { key: 'hero_desc_ru', label: 'Описание в герое C (RU / EN)', multiline: true },
      { key: 'hero_video_url', label: 'Ссылка на видео Hero (RU / EN)' },
      { key: 'hero_video_poster', label: 'Постер видео Hero (RU / EN)' },
    ],
  },
  {
    label: 'Введение (о месте)',
    keys: [
      { key: 'intro_heading_ru', label: 'Заголовок (RU / EN)' },
      { key: 'intro_p1_ru', label: 'Первый абзац (RU / EN)', multiline: true },
      { key: 'intro_p2_ru', label: 'Второй абзац (RU / EN)', multiline: true },
    ],
  },
  {
    label: 'Факты (цифры)',
    keys: [
      { key: 'fact1_number', label: 'Факт 1: число' },
      { key: 'fact1_label_ru', label: 'Факт 1: подпись (RU / EN)' },
      { key: 'fact2_number', label: 'Факт 2: число' },
      { key: 'fact2_label_ru', label: 'Факт 2: подпись (RU / EN)' },
      { key: 'fact3_number', label: 'Факт 3: число' },
      { key: 'fact3_label_ru', label: 'Факт 3: подпись (RU / EN)' },
    ],
  },
  {
    label: 'Контактная информация',
    keys: [
      { key: 'address_ru', label: 'Адрес (RU / EN)' },
      { key: 'hours_ru', label: 'Часы работы (RU / EN)' },
      { key: 'phone', label: 'Телефон' },
      { key: 'email_rent', label: 'Email аренды' },
      { key: 'email_press', label: 'Email пресс-службы' },
      { key: 'metro_ru', label: 'Метро (RU / EN)' },
    ],
  },
  {
    label: 'Ближайшее событие (герой)',
    keys: [
      { key: 'next_event_ru', label: 'Название ближайшего события (RU / EN)' },
      { key: 'next_event_date_ru', label: 'Дата/время (RU / EN)' },
    ],
  },
  {
    label: 'Подвал (footer)',
    keys: [
      { key: 'footer_tagline_ru', label: 'Слоган (RU / EN)', multiline: true },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    adminApi.getSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRow = (key: string): SettingRow =>
    settings.find((s) => s.key === key) ?? { key, value_ru: '', value_en: '' };

  const updateRow = (key: string, field: 'value_ru' | 'value_en', value: string) => {
    setSettings((prev) => {
      const exists = prev.find((s) => s.key === key);
      if (exists) return prev.map((s) => s.key === key ? { ...s, [field]: value } : s);
      return [...prev, { key, value_ru: field === 'value_ru' ? value : '', value_en: field === 'value_en' ? value : '' }];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (
    key: string,
    field: 'value_ru' | 'value_en',
    file: File | undefined
  ) => {
    if (!file) return;
    const uploadKey = `${key}:${field}`;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));
    try {
      const url = await adminApi.uploadFile(file);
      updateRow(key, field, url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка загрузки файла');
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  if (loading) return <div className="text-sm text-muted">Загрузка...</div>;

  return (
    <motion.div
      className="grid gap-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">ТЕКСТЫ · КОНТАКТЫ · CMS</div>
          <h1 className="mt-2 font-heading text-[clamp(48px,7vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.06em]">Настройки</h1>
        </div>
        <button className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : saved ? '✓ СОХРАНЕНО' : 'СОХРАНИТЬ →'}
        </button>
      </div>

      {GROUPS.map((group, groupIndex) => (
        <motion.div
          key={group.label}
          className="rounded-3xl border border-line bg-white p-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: groupIndex * 0.03 }}
        >
          <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {group.label}
          </div>
          <div className="grid gap-5">
            {group.keys.map(({ key, label, multiline }) => {
              const row = getRow(key);
              return (
                <div key={key} className="grid gap-3 border-t border-line pt-5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                    {label}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">RU</div>
                      {multiline ? (
                        <textarea
                          value={row.value_ru}
                          onChange={(e) => updateRow(key, 'value_ru', e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-line bg-white p-3 outline-none transition focus:border-ink"
                        />
                      ) : (
                        <>
                          <input
                            value={row.value_ru}
                            onChange={(e) => updateRow(key, 'value_ru', e.target.value)}
                            className="min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
                          />
                          {key === 'hero_video_url' ? (
                            <label className="mt-2 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-line bg-paper px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                              {uploading[`${key}:value_ru`] ? 'Загрузка...' : 'Загрузить видео'}
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.ogg,.mov,.m4v,.avi,.mkv"
                                onChange={(e) => handleMediaUpload(key, 'value_ru', e.target.files?.[0])}
                                className="hidden"
                              />
                            </label>
                          ) : null}
                        </>
                      )}
                    </div>
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">EN</div>
                      {multiline ? (
                        <textarea
                          value={row.value_en}
                          onChange={(e) => updateRow(key, 'value_en', e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-line bg-white p-3 outline-none transition focus:border-ink"
                        />
                      ) : (
                        <>
                          <input
                            value={row.value_en}
                            onChange={(e) => updateRow(key, 'value_en', e.target.value)}
                            className="min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
                          />
                          {key === 'hero_video_url' ? (
                            <label className="mt-2 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-line bg-paper px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                              {uploading[`${key}:value_en`] ? 'Uploading...' : 'Upload video'}
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.ogg,.mov,.m4v,.avi,.mkv"
                                onChange={(e) => handleMediaUpload(key, 'value_en', e.target.files?.[0])}
                                className="hidden"
                              />
                            </label>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <button className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-xl disabled:opacity-60" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : saved ? '✓ СОХРАНЕНО' : 'СОХРАНИТЬ ВСЕ ИЗМЕНЕНИЯ →'}
        </button>
      </div>
    </motion.div>
  );
}
