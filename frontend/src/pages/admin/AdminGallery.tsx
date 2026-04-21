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
            ? <img src={r.image} style={{ width: 60, height: 45, objectFit: 'cover', border: '1px solid var(--ink)' }} alt="" />
            : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>,
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
    <form onSubmit={handleSubmit} className="admin-form">
      <ImageUpload
        label="Фотография *"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Подпись (RU)</label>
          <input value={form.caption_ru} onChange={set('caption_ru')} />
        </div>
        <div className="admin-form-group">
          <label>Caption (EN)</label>
          <input value={form.caption_en} onChange={set('caption_en')} />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Категория (RU)</label>
          <select value={form.category_ru} onChange={set('category_ru')}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="admin-form-group">
          <label>Category (EN)</label>
          <input value={form.category_en} onChange={set('category_en')} />
        </div>
      </div>

      <div className="admin-form-group" style={{ maxWidth: '240px' }}>
        <label>Размер в сетке (span)</label>
        <select value={form.span || ''} onChange={set('span')}>
          <option value="">1×1 (стандарт)</option>
          <option value="span2">2×1 (широкий)</option>
          <option value="span2h">1×2 (высокий)</option>
          <option value="span2 span2h">2×2 (большой)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <label className="admin-toggle">
          <input type="checkbox" checked={form.is_active} onChange={setCheck('is_active')} />
          Активно
        </label>
        <div className="admin-form-group" style={{ width: '120px' }}>
          <label>Порядок</label>
          <input type="number" value={form.sort_order} onChange={set('sort_order')} />
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn solid" disabled={saving}>
          {saving ? 'Сохранение...' : 'СОХРАНИТЬ →'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>ОТМЕНА</button>
      </div>
    </form>
  );
}
