import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  author: '',
  text: '',
  rating: 5,
  date_label: '',
  is_pinned: false,
  is_active: true,
  sort_order: 0,
};

export default function AdminReviews() {
  return (
    <AdminCrudPage
      title="Отзывы"
      subtitle="РУЧНЫЕ ОТЗЫВЫ · АВТО С ЯНДЕКСА ПОДТЯГИВАЮТСЯ САМИ"
      columns={[
        { key: 'author', label: 'Автор' },
        { key: 'rating', label: '★', render: (r: typeof EMPTY) => '★'.repeat(r.rating || 0) },
        { key: 'text', label: 'Текст', render: (r: typeof EMPTY) => String(r.text || '').slice(0, 60) },
        { key: 'is_pinned', label: 'Закреп.', render: (r: typeof EMPTY) => (r.is_pinned ? 'да' : '') },
      ]}
      fetchFn={adminApi.getReviews}
      deleteFn={adminApi.deleteReview}
      renderForm={(item, onSave, onCancel) => (
        <ReviewForm item={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}

function ReviewForm({ item, onSave, onCancel }: { item: unknown; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...(item as typeof EMPTY || {}) });
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) || 5, sort_order: Number(form.sort_order) || 0 };
      if (form.id) await adminApi.updateReview(form.id, payload);
      else await adminApi.createReview(payload);
      onSave();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-zinc-200 [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-accent [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-zinc-500 [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-zinc-200 [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea:focus]:border-accent">
      <div className="grid gap-4 md:grid-cols-[1fr_140px_160px]">
        <div className="grid gap-2">
          <label>Автор</label>
          <input value={form.author} onChange={set('author')} required placeholder="Имя гостя" />
        </div>
        <div className="grid gap-2">
          <label>Оценка (1–5)</label>
          <input type="number" min={1} max={5} value={form.rating} onChange={set('rating')} />
        </div>
        <div className="grid gap-2">
          <label>Дата (текст)</label>
          <input value={form.date_label} onChange={set('date_label')} placeholder="Май 2026" />
        </div>
      </div>

      <div className="grid gap-2">
        <label>Текст отзыва</label>
        <textarea value={form.text} onChange={set('text')} rows={5} required />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={!!form.is_pinned}
            onChange={(e) => setForm((p) => ({ ...p, is_pinned: e.target.checked }))}
            className="h-4 w-4 accent-ink"
          />
          Закрепить (показывать первым)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 accent-ink"
          />
          Показывать на сайте
        </label>
        <div className="grid max-w-32 gap-2">
          <label>Порядок</label>
          <input type="number" value={form.sort_order} onChange={set('sort_order')} />
        </div>
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
