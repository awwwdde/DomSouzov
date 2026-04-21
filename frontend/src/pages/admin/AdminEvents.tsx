import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  title_ru: '', title_en: '',
  date: '', date_en: '',
  time: '',
  weekday_ru: '', weekday_en: '',
  hall_ru: 'Колонный зал', hall_en: 'Hall of Columns',
  tag_ru: '', tag_en: '',
  price_ru: '', price_en: '',
  description_ru: '', description_en: '',
  image: '',
  is_featured: false,
  is_active: true,
  sort_order: 0,
  created_at: '',
};

export default function AdminEvents() {
  return (
    <AdminCrudPage
      title="Мероприятия"
      subtitle="АФИША · СОБЫТИЯ"
      columns={[
        { key: 'title_ru', label: 'Название (RU)' },
        { key: 'date', label: 'Дата' },
        { key: 'hall_ru', label: 'Зал' },
        { key: 'tag_ru', label: 'Жанр' },
        { key: 'price_ru', label: 'Цена' },
        { key: 'is_active', label: 'Активно', render: (r: typeof EMPTY) => r.is_active ? '✓' : '✗' },
      ]}
      fetchFn={adminApi.getEvents}
      deleteFn={adminApi.deleteEvent}
      renderForm={(item, onSave, onCancel) => (
        <EventForm item={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}

function EventForm({ item, onSave, onCancel }: { item: unknown; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...(item as typeof EMPTY || {}) });
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setCheck = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.checked }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (form.id) await adminApi.updateEvent(form.id, payload);
      else await adminApi.createEvent(payload);
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
          <input value={form.title_ru} onChange={set('title_ru')} required />
        </div>
        <div className="admin-form-group">
          <label>Title (EN)</label>
          <input value={form.title_en} onChange={set('title_en')} required />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Дата (RU, напр. «19 ИЮН 2026»)</label>
          <input value={form.date} onChange={set('date')} required placeholder="19 ИЮН 2026" />
        </div>
        <div className="admin-form-group">
          <label>Date (EN, e.g. «19 JUN 2026»)</label>
          <input value={form.date_en} onChange={set('date_en')} required placeholder="19 JUN 2026" />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Время (напр. «19:30»)</label>
          <input value={form.time} onChange={set('time')} required placeholder="19:30" />
        </div>
        <div className="admin-form-group">
          <label>День недели RU / EN (напр. «Пт» / «Fri»)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input value={form.weekday_ru} onChange={set('weekday_ru')} placeholder="Пт" />
            <input value={form.weekday_en} onChange={set('weekday_en')} placeholder="Fri" />
          </div>
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Зал (RU)</label>
          <select value={form.hall_ru} onChange={set('hall_ru')}>
            <option value="Колонный зал">Колонный зал</option>
            <option value="Октябрьский зал">Октябрьский зал</option>
          </select>
        </div>
        <div className="admin-form-group">
          <label>Hall (EN)</label>
          <select value={form.hall_en} onChange={set('hall_en')}>
            <option value="Hall of Columns">Hall of Columns</option>
            <option value="October Hall">October Hall</option>
          </select>
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Жанр (RU)</label>
          <input value={form.tag_ru} onChange={set('tag_ru')} required placeholder="Симфоническая" />
        </div>
        <div className="admin-form-group">
          <label>Tag (EN)</label>
          <input value={form.tag_en} onChange={set('tag_en')} required placeholder="Symphonic" />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Цена (RU)</label>
          <input value={form.price_ru} onChange={set('price_ru')} placeholder="от 2 500 ₽" />
        </div>
        <div className="admin-form-group">
          <label>Price (EN)</label>
          <input value={form.price_en} onChange={set('price_en')} placeholder="from 2,500 ₽" />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Описание (RU)</label>
          <textarea value={form.description_ru} onChange={set('description_ru')} rows={4} />
        </div>
        <div className="admin-form-group">
          <label>Description (EN)</label>
          <textarea value={form.description_en} onChange={set('description_en')} rows={4} />
        </div>
      </div>

      <ImageUpload
        label="Постер / изображение"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <label className="admin-toggle">
          <input type="checkbox" checked={form.is_featured} onChange={setCheck('is_featured')} />
          Рекомендуется (featured)
        </label>
        <label className="admin-toggle">
          <input type="checkbox" checked={form.is_active} onChange={setCheck('is_active')} />
          Активно (публикуется)
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
