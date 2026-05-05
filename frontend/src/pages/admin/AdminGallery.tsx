import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  caption_ru: '', caption_en: '',
  category_ru: 'Архитектура', category_en: 'Architecture',
  image: '',
  span: '',
  sort_order: 0,
  is_active: true,
};

const CATS = ['Архитектура', 'Концерты', 'Реставрация', 'Архив'];

export default function AdminGallery() {
  return (
    <AdminCrudPage
      title="Галерея"
      subtitle="ФОТО · МЕДИА"
      columns={[
        {
          key: 'image',
          label: 'Фото',
          render: (r: typeof EMPTY) => r.image
            ? <img src={r.image} className="h-[45px] w-[60px] rounded-lg border border-ink object-cover" alt="" />
            : <span className="text-xs text-muted">—</span>,
        },
        { key: 'caption_ru', label: 'Подпись (RU)' },
        { key: 'category_ru', label: 'Категория' },
        { key: 'span', label: 'Размер' },
        { key: 'is_active', label: 'Активно', render: (r: typeof EMPTY) => r.is_active ? '✓' : '✗' },
      ]}
      fetchFn={adminApi.getGallery}
      deleteFn={adminApi.deleteGallery}
      renderForm={(item, onSave, onCancel) => (
        <GalleryForm item={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}

function GalleryForm({ item, onSave, onCancel }: { item: unknown; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...(item as typeof EMPTY || {}) });
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setCheck = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.checked }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await adminApi.updateGallery(form.id, form);
      else await adminApi.createGallery(form);
      onSave();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-ink [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-muted [&_select]:min-h-11 [&_select]:rounded-xl [&_select]:border [&_select]:border-line [&_select]:bg-white [&_select]:px-3">
      <ImageUpload
        label="Фотография *"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Подпись (RU)</label>
          <input value={form.caption_ru} onChange={set('caption_ru')} />
        </div>
        <div className="grid gap-2">
          <label>Caption (EN)</label>
          <input value={form.caption_en} onChange={set('caption_en')} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Категория (RU)</label>
          <select value={form.category_ru} onChange={set('category_ru')}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <label>Category (EN)</label>
          <input value={form.category_en} onChange={set('category_en')} />
        </div>
      </div>

      <div className="grid max-w-60 gap-2">
        <label>Размер в сетке (span)</label>
        <select value={form.span || ''} onChange={set('span')}>
          <option value="">1×1 (стандарт)</option>
          <option value="span2">2×1 (широкий)</option>
          <option value="span2h">1×2 (высокий)</option>
          <option value="span2 span2h">2×2 (большой)</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="inline-flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" checked={form.is_active} onChange={setCheck('is_active')} />
          Активно
        </label>
        <div className="grid w-32 gap-2">
          <label>Порядок</label>
          <input type="number" value={form.sort_order} onChange={set('sort_order')} />
        </div>
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
