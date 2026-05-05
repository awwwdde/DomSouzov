import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  tag_ru: '', tag_en: '',
  title_ru: '', title_en: '',
  excerpt_ru: '', excerpt_en: '',
  content_ru: '', content_en: '',
  image: '',
  is_lead: false,
  is_active: true,
  sort_order: 0,
  created_at: '',
};

export default function AdminNews() {
  return (
    <AdminCrudPage
      title="Хроники"
      subtitle="НОВОСТИ · СТАТЬИ · ИНТЕРВЬЮ"
      columns={[
        { key: 'tag_ru', label: 'Рубрика' },
        { key: 'title_ru', label: 'Заголовок (RU)' },
        { key: 'is_lead', label: 'Лид', render: (r: typeof EMPTY) => r.is_lead ? '★' : '' },
        { key: 'is_active', label: 'Активно', render: (r: typeof EMPTY) => r.is_active ? '✓' : '✗' },
      ]}
      fetchFn={adminApi.getNews}
      deleteFn={adminApi.deleteNews}
      renderForm={(item, onSave, onCancel) => (
        <NewsForm item={item} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}

function NewsForm({ item, onSave, onCancel }: { item: unknown; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...(item as typeof EMPTY || {}) });
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setCheck = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.checked }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await adminApi.updateNews(form.id, form);
      else await adminApi.createNews(form);
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
          <label>Рубрика (RU)</label>
          <input value={form.tag_ru} onChange={set('tag_ru')} required placeholder="ФЕСТИВАЛЬ · 2026" />
        </div>
        <div className="grid gap-2">
          <label>Tag (EN)</label>
          <input value={form.tag_en} onChange={set('tag_en')} required placeholder="FESTIVAL · 2026" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Заголовок (RU)</label>
          <input value={form.title_ru} onChange={set('title_ru')} required />
        </div>
        <div className="grid gap-2">
          <label>Title (EN)</label>
          <input value={form.title_en} onChange={set('title_en')} required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Анонс (RU)</label>
          <textarea value={form.excerpt_ru} onChange={set('excerpt_ru')} required rows={3} />
        </div>
        <div className="grid gap-2">
          <label>Excerpt (EN)</label>
          <textarea value={form.excerpt_en} onChange={set('excerpt_en')} required rows={3} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Полный текст (RU)</label>
          <textarea value={form.content_ru} onChange={set('content_ru')} rows={8} />
        </div>
        <div className="grid gap-2">
          <label>Full text (EN)</label>
          <textarea value={form.content_en} onChange={set('content_en')} rows={8} />
        </div>
      </div>

      <ImageUpload
        label="Изображение статьи"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" checked={form.is_lead} onChange={setCheck('is_lead')} />
          Главная статья (лид)
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
