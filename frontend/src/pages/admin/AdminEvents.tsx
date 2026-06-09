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
  has_ticket: false,
  ticket_url: '',
  age_rating: '',
  is_featured: false,
  is_active: true,
  sort_order: 0,
  created_at: '',
};

const AGE_OPTIONS = ['', '0+', '6+', '12+', '16+', '18+'];

const CATEGORIES = [
  { ru: 'Концерт', en: 'Concert' },
  { ru: 'Мероприятие', en: 'Event' },
  { ru: 'Экскурсия', en: 'Excursion' },
  { ru: 'Собрание', en: 'Meeting' },
];

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
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-ink [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-muted [&_select]:min-h-11 [&_select]:rounded-xl [&_select]:border [&_select]:border-line [&_select]:bg-white [&_select]:px-3 [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea:focus]:border-ink">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Название (RU)</label>
          <input value={form.title_ru} onChange={set('title_ru')} required />
        </div>
        <div className="grid gap-2">
          <label>Title (EN)</label>
          <input value={form.title_en} onChange={set('title_en')} required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Дата (RU, напр. «19 ИЮН 2026»)</label>
          <input value={form.date} onChange={set('date')} required placeholder="19 ИЮН 2026" />
        </div>
        <div className="grid gap-2">
          <label>Date (EN, e.g. «19 JUN 2026»)</label>
          <input value={form.date_en} onChange={set('date_en')} required placeholder="19 JUN 2026" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Время (напр. «19:30»)</label>
          <input value={form.time} onChange={set('time')} required placeholder="19:30" />
        </div>
        <div className="grid gap-2">
          <label>День недели RU / EN (напр. «Пт» / «Fri»)</label>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.weekday_ru} onChange={set('weekday_ru')} placeholder="Пт" />
            <input value={form.weekday_en} onChange={set('weekday_en')} placeholder="Fri" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Зал (RU)</label>
          <select value={form.hall_ru} onChange={set('hall_ru')}>
            <option value="Колонный зал">Колонный зал</option>
            <option value="Октябрьский зал">Октябрьский зал</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label>Hall (EN)</label>
          <select value={form.hall_en} onChange={set('hall_en')}>
            <option value="Hall of Columns">Hall of Columns</option>
            <option value="October Hall">October Hall</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label>Категория</label>
        <select
          value={form.tag_ru || 'Концерт'}
          onChange={(e) => {
            const ru = e.target.value;
            const en = CATEGORIES.find((c) => c.ru === ru)?.en || ru;
            setForm((p) => ({ ...p, tag_ru: ru, tag_en: en }));
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.ru} value={c.ru}>{c.ru}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Цена (RU)</label>
          <input value={form.price_ru} onChange={set('price_ru')} placeholder="от 2 500 ₽" />
        </div>
        <div className="grid gap-2">
          <label>Price (EN)</label>
          <input value={form.price_en} onChange={set('price_en')} placeholder="from 2,500 ₽" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Описание (RU)</label>
          <textarea value={form.description_ru} onChange={set('description_ru')} rows={4} />
        </div>
        <div className="grid gap-2">
          <label>Description (EN)</label>
          <textarea value={form.description_en} onChange={set('description_en')} rows={4} />
        </div>
      </div>

      <ImageUpload
        label="Постер / изображение"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      {/* Билеты (внешний сервис) + возраст */}
      <div className="grid gap-4 rounded-2xl border border-line bg-paper-soft p-4 md:grid-cols-[auto_1fr_140px] md:items-end">
        <label className="inline-flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" checked={form.has_ticket} onChange={setCheck('has_ticket')} />
          Есть билеты
        </label>
        <div className="grid gap-2">
          <label>Ссылка на покупку (внешний сервис)</label>
          <input
            value={form.ticket_url}
            onChange={set('ticket_url')}
            placeholder="https://tickets.example.ru/event/123"
          />
        </div>
        <div className="grid gap-2">
          <label>Возраст</label>
          <select value={form.age_rating} onChange={set('age_rating')}>
            {AGE_OPTIONS.map((a) => (
              <option key={a} value={a}>{a || '—'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" checked={form.is_featured} onChange={setCheck('is_featured')} />
          Рекомендуется (featured)
        </label>
        <label className="inline-flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" checked={form.is_active} onChange={setCheck('is_active')} />
          Активно (публикуется)
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
