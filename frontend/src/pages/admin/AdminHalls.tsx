import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  name_ru: '', name_en: '',
  capacity: '', area: '',
  features_ru: '', features_en: '',
  description_ru: '', description_en: '',
  image: '',
  gallery: '',
  scheme: '',
  equipment_ru: '', equipment_en: '',
  rider_only: false,
  sort_order: 0,
};

/** URL-ы фото зала хранятся JSON-массивом в поле gallery. */
function parseUrls(raw: string): string[] {
  try {
    const a = JSON.parse(raw || '[]');
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

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
  const [galBusy, setGalBusy] = useState(false);
  const [schemeBusy, setSchemeBusy] = useState(false);

  const uploadScheme = async (file: File | undefined) => {
    if (!file) return;
    setSchemeBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      setForm((p) => ({ ...p, scheme: url }));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setSchemeBusy(false);
    }
  };

  const MAX_HALL_PHOTOS = 5;
  const gallery = parseUrls(form.gallery);
  const setGallery = (arr: string[]) => setForm((p) => ({ ...p, gallery: JSON.stringify(arr) }));
  const addImage = async (file: File | undefined) => {
    if (!file) return;
    if (gallery.length >= MAX_HALL_PHOTOS) {
      alert(`Можно загрузить не более ${MAX_HALL_PHOTOS} фото зала.`);
      return;
    }
    setGalBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      setGallery([...gallery, url]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setGalBusy(false);
    }
  };
  const removeImage = (i: number) => setGallery(gallery.filter((_, j) => j !== i));

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
      // Главное фото = первое из галереи (для превью/SEO).
      const payload = { ...form, features_ru: JSON.stringify(clean), features_en: '', image: gallery[0] || '' };
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
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-zinc-200 [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-accent [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-zinc-500 [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-zinc-200 [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea:focus]:border-accent">
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
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
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

      <div className="grid gap-2">
        <label>Фото зала (до 5 — на странице листаются слайдером)</label>
        <div className="flex flex-wrap gap-3">
          {gallery.map((url, i) => (
            <div key={i} className="relative h-24 w-32 overflow-hidden rounded-lg border border-line">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white">Главное</span>
              ) : null}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-sm text-white"
                aria-label="Удалить"
              >
                ×
              </button>
            </div>
          ))}
          {gallery.length < MAX_HALL_PHOTOS ? (
            <label className="flex h-24 w-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-paper text-xs font-semibold text-ink transition hover:border-ink">
              {galBusy ? '…' : '+ Фото'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => addImage(e.target.files?.[0])} />
            </label>
          ) : null}
        </div>
      </div>

      {/* СХЕМА — изображение плана/рассадки зала. */}
      <div className="grid gap-2">
        <label>Схема зала (план / рассадка)</label>
        <div className="flex flex-wrap items-center gap-3">
          {form.scheme ? (
            <div className="relative h-28 w-40 overflow-hidden rounded-lg border border-line bg-white">
              <img src={form.scheme} alt="" className="h-full w-full object-contain p-1" />
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, scheme: '' }))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-sm text-white"
                aria-label="Удалить"
              >
                ×
              </button>
            </div>
          ) : null}
          <label className="flex h-28 w-40 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-paper text-xs font-semibold text-ink transition hover:border-ink">
            {schemeBusy ? '…' : form.scheme ? '+ Заменить' : '+ Схема'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadScheme(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      {/* ОБОРУДОВАНИЕ — тех. райдер, по одному пункту на строку. */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Оборудование (RU) — по строке на пункт</label>
          <textarea value={form.equipment_ru} onChange={set('equipment_ru')} rows={6} placeholder={'Цифровой микшер Soundcraft Vi6\nЛинейный массив CODA AUDIO 300 Вт (24 шт)\n…'} />
        </div>
        <div className="grid gap-2">
          <label>Equipment (EN) — one item per line</label>
          <textarea value={form.equipment_en} onChange={set('equipment_en')} rows={6} placeholder={'Soundcraft Vi6 digital mixer\n…'} />
        </div>
      </div>

      {/* ФЛАГ — буфет/анфилада: только в тех. райдере, не на странице «Залы». */}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-paper-soft p-3">
        <input
          type="checkbox"
          checked={!!form.rider_only}
          onChange={(e) => setForm((p) => ({ ...p, rider_only: e.target.checked }))}
          className="h-4 w-4 accent-ink"
        />
        <span className="text-[12px] font-semibold text-ink">
          Только в техническом райдере (буфет, анфилада) — не показывать как отдельный зал на странице «Залы»
        </span>
      </label>

      <div className="grid max-w-32 gap-2">
        <label>Порядок</label>
        <input type="number" value={form.sort_order} onChange={set('sort_order')} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-full border border-accent bg-accent px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60" disabled={saving}>
          {saving ? 'Сохранение...' : 'СОХРАНИТЬ →'}
        </button>
        <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-full border border-line bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]" onClick={onCancel}>ОТМЕНА</button>
      </div>
    </form>
  );
}
