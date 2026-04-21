import { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';

type SettingRow = { key: string; value_ru: string; value_en: string };

const GROUPS: { label: string; keys: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    label: 'Герой (главная страница)',
    keys: [
      { key: 'hero_kicker_ru', label: 'Кикер под логотипом (RU / EN)', multiline: false },
      { key: 'hero_subtitle_ru', label: 'Подзаголовок героя (RU / EN)' },
      { key: 'hero_desc_ru', label: 'Описание в герое C (RU / EN)', multiline: true },
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

  if (loading) return <div className="admin-page mono" style={{ color: 'var(--muted)' }}>Загрузка...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sub">ТЕКСТЫ · КОНТАКТЫ · CMS</div>
          <h1>Настройки</h1>
        </div>
        <button className="btn solid" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : saved ? '✓ СОХРАНЕНО' : 'СОХРАНИТЬ →'}
        </button>
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: '48px' }}>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--ink)' }}>
            {group.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {group.keys.map(({ key, label, multiline }) => {
              const row = getRow(key);
              return (
                <div key={key}>
                  <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'var(--muted)', marginBottom: '8px' }}>
                    {label}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div className="mono" style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '4px' }}>RU</div>
                      {multiline ? (
                        <textarea
                          value={row.value_ru}
                          onChange={(e) => updateRow(key, 'value_ru', e.target.value)}
                          rows={3}
                          style={{ width: '100%', border: '1px solid var(--ink)', padding: '10px 14px', fontFamily: 'Inter', fontSize: '14px', background: 'transparent', outline: 'none', resize: 'vertical' }}
                        />
                      ) : (
                        <input
                          value={row.value_ru}
                          onChange={(e) => updateRow(key, 'value_ru', e.target.value)}
                          style={{ width: '100%', border: '1px solid var(--ink)', padding: '10px 14px', fontFamily: 'Inter', fontSize: '14px', background: 'transparent', outline: 'none' }}
                        />
                      )}
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '4px' }}>EN</div>
                      {multiline ? (
                        <textarea
                          value={row.value_en}
                          onChange={(e) => updateRow(key, 'value_en', e.target.value)}
                          rows={3}
                          style={{ width: '100%', border: '1px solid var(--ink)', padding: '10px 14px', fontFamily: 'Inter', fontSize: '14px', background: 'transparent', outline: 'none', resize: 'vertical' }}
                        />
                      ) : (
                        <input
                          value={row.value_en}
                          onChange={(e) => updateRow(key, 'value_en', e.target.value)}
                          style={{ width: '100%', border: '1px solid var(--ink)', padding: '10px 14px', fontFamily: 'Inter', fontSize: '14px', background: 'transparent', outline: 'none' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--paper)', borderTop: '1px solid var(--ink)', padding: '16px 0', display: 'flex', gap: '10px' }}>
        <button className="btn solid" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : saved ? '✓ СОХРАНЕНО' : 'СОХРАНИТЬ ВСЕ ИЗМЕНЕНИЯ →'}
        </button>
      </div>
    </div>
  );
}
