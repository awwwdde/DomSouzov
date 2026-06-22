import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  name_ru: '', name_en: '',
  capacity: '', area: '',
  features_ru: '', features_en: '',
  description_ru: '', description_en: '',
  image: '',
  sort_order: 0,
};

/** Особенность зала: заголовок + текст на двух языках. */
interface Feature {
  title_ru: string;
  title_en: string;
  text_ru: string;
  text_en: string;
}

/** Особенности хранятся JSON-массивом в поле features_ru.
 *  Если там лежит легаси-строка (старый формат) — начинаем с пустого списка. */
function parseFeatures(raw: string): Feature[] {
  try {
    const a = JSON.parse(raw || '[]');
    if (!Array.isArray(a)) return [];
    return a
      .filter((x) => x && typeof x === 'object')
      .map((x) => ({
        title_ru: String(x.title_ru || ''),
        title_en: String(x.title_en || ''),
        text_ru: String(x.text_ru || ''),
        text_en: String(x.text_en || ''),
      }));
  } catch {
    return [];
  }
}

export default function AdminHalls() {
  return (
    <AdminCrudPage
      title="Залы"
      subtitle="КОЛОННЫЙ · ОКТЯБРЬСКИЙ"
      columns={[
        { key: 'name_ru', label: 'Название (RU)' },
        { key: 'capacity', label: 'Вместимость' },
        { key: 'area', label: 'Площадь' },
        { key: 'features_ru', label: 'Особенностей', render: (r: typeof EMPTY) => String(parseFeatures(r.features_ru).length) },
      ]}
      fetchFn={adminApi.getHalls}
      deleteFn={adminApi.deleteHall}
      renderForm={(item, onSave, onCancel) => (
        <HallForm item={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}

function HallForm({ item, onSave, onCancel }: { item: unknown; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...(item as typeof EMPTY || {}) });
  const [features, setFeatures] = useState<Feature[]>(() => parseFeatures((item as typeof EMPTY)?.features_ru || ''));
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const addFeature = () =>
    setFeatures((p) => [...p, { title_ru: '', title_en: '', text_ru: '', text_en: '' }]);
  const removeFeature = (i: number) => setFeatures((p) => p.filter((_, j) => j !== i));
  const setFeature = (i: number, key: keyof Feature, value: string) =>
    setFeatures((p) => p.map((f, j) => (j === i ? { ...f, [key]: value } : f)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Особенности пишем JSON-массивом в features_ru; features_en больше не используем.
      const clean = features.filter((f) => f.title_ru || f.title_en || f.text_ru || f.text_en);
      const payload = { ...form, features_ru: JSON.stringify(clean), features_en: '' };
      if (form.id) await adminApi.updateHall(form.id, payload);
      else await adminApi.createHall(payload);
      onSave();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-ink [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-muted [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea:focus]:border-ink">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Название (RU)</label>
          <input value={form.name_ru} onChange={set('name_ru')} required placeholder="Колонный зал" />
        </div>
        <div className="grid gap-2">
          <label>Name (EN)</label>
          <input value={form.name_en} onChange={set('name_en')} required placeholder="Hall of Columns" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Вместимость</label>
          <input value={form.capacity} onChange={set('capacity')} placeholder="1 200 мест" />
        </div>
        <div className="grid gap-2">
          <label>Площадь</label>
          <input value={form.area} onChange={set('area')} placeholder="1 120 м²" />
        </div>
      </div>

      {/* ОСОБЕННОСТИ — repeatable список «заголовок + текст» (RU/EN). */}
      <div className="grid gap-3 rounded-2xl border border-line bg-paper-soft p-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Особенности</label>
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
          >
            <Plus size={13} /> Добавить
          </button>
        </div>

        {features.length === 0 ? (
          <p className="py-2 text-sm text-muted">Пока нет особенностей. Нажмите «Добавить».</p>
        ) : (
          <div className="grid gap-4">
            {features.map((f, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-line bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">№ {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700"
                  >
                    <Trash2 size={12} /> Удалить
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={f.title_ru} onChange={(e) => setFeature(i, 'title_ru', e.target.value)} placeholder="Заголовок (RU) — напр. «Акустика»" />
                  <input value={f.title_en} onChange={(e) => setFeature(i, 'title_en', e.target.value)} placeholder="Title (EN) — e.g. «Acoustics»" />
                  <input value={f.text_ru} onChange={(e) => setFeature(i, 'text_ru', e.target.value)} placeholder="Текст (RU) — напр. «Класс A»" />
                  <input value={f.text_en} onChange={(e) => setFeature(i, 'text_en', e.target.value)} placeholder="Text (EN) — e.g. «Class A»" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Описание (RU)</label>
          <textarea value={form.description_ru} onChange={set('description_ru')} rows={5} />
        </div>
        <div className="grid gap-2">
          <label>Description (EN)</label>
          <textarea value={form.description_en} onChange={set('description_en')} rows={5} />
        </div>
      </div>

      <ImageUpload
        label="Фото зала"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      <div className="grid max-w-32 gap-2">
        <label>Порядок</label>
        <input type="number" value={form.sort_order} onChange={set('sort_order')} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60" disabled={saving}>
          {saving ? 'Сохранение...' : 'СОХРАНИТЬ →'}
        </button>
        <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-full border border-line bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]" onClick={onCancel}>ОТМЕНА</button>
      </div>
    </form>
  );
}
