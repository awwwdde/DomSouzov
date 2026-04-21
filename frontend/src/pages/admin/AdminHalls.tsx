import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  name_ru: '', name_en: '',
  capacity: '', area: '',
  columns: '',
  features_ru: '', features_en: '',
  description_ru: '', description_en: '',
  image: '',
  sort_order: 0,
};

export default function AdminHalls() {
  return (
    <AdminCrudPage
      title="Залы"
      subtitle="КОЛОННЫЙ · ОКТЯБРЬСКИЙ"
      columns={[
        { key: 'name_ru', label: 'Название (RU)' },
        { key: 'capacity', label: 'Вместимость' },
        { key: 'area', label: 'Площадь' },
        { key: 'features_ru', label: 'Особенности' },
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
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await adminApi.updateHall(form.id, form);
      else await adminApi.createHall(form);
      onSave();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Название (RU)</label>
          <input value={form.name_ru} onChange={set('name_ru')} required placeholder="Колонный зал" />
        </div>
        <div className="admin-form-group">
          <label>Name (EN)</label>
          <input value={form.name_en} onChange={set('name_en')} required placeholder="Hall of Columns" />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Вместимость</label>
          <input value={form.capacity} onChange={set('capacity')} placeholder="1 200 мест" />
        </div>
        <div className="admin-form-group">
          <label>Площадь</label>
          <input value={form.area} onChange={set('area')} placeholder="1 120 м²" />
        </div>
      </div>

      <div className="admin-form-group" style={{ maxWidth: '240px' }}>
        <label>Количество колонн</label>
        <input value={form.columns} onChange={set('columns')} placeholder="28" />
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Особенности (RU)</label>
          <input value={form.features_ru} onChange={set('features_ru')} placeholder="28 колонн · Акустика класса A" />
        </div>
        <div className="admin-form-group">
          <label>Features (EN)</label>
          <input value={form.features_en} onChange={set('features_en')} placeholder="28 columns · Acoustic class A" />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Описание (RU)</label>
          <textarea value={form.description_ru} onChange={set('description_ru')} rows={5} />
        </div>
        <div className="admin-form-group">
          <label>Description (EN)</label>
          <textarea value={form.description_en} onChange={set('description_en')} rows={5} />
        </div>
      </div>

      <ImageUpload
        label="Фото зала"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      <div className="admin-form-group" style={{ maxWidth: '120px' }}>
        <label>Порядок</label>
        <input type="number" value={form.sort_order} onChange={set('sort_order')} />
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
