import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import { adminApi } from '../../api/client';
import { NEWS_CATEGORIES } from '../../lib/categories';

const EMPTY = {
  id: 0,
  tag_ru: '', tag_en: '',
  title_ru: '', title_en: '',
  excerpt_ru: '', excerpt_en: '',
  content_ru: '', content_en: '',
  image: '',
  gallery: '',
  is_lead: false,
  is_active: true,
  sort_order: 0,
  created_at: '',
};

type Media = { type: 'image' | 'video'; url: string };

/** Разбирает галерею: легаси-строки = фото, новый формат — объекты {type,url}. */
function parseGallery(s: string): Media[] {
  try {
    const a = JSON.parse(s || '[]');
    if (!Array.isArray(a)) return [];
    return a
      .map((x): Media | null => {
        if (typeof x === 'string') return x ? { type: 'image', url: x } : null;
        if (x && typeof x === 'object' && typeof x.url === 'string' && x.url) {
          return { type: x.type === 'video' ? 'video' : 'image', url: x.url };
        }
        return null;
      })
      .filter((x): x is Media => x !== null);
  } catch {
    return [];
  }
}

/** ISO-строка → значение для <input type="datetime-local"> (локальное время). */
function toLocalInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
  const [publishAt, setPublishAt] = useState(toLocalInput((item as typeof EMPTY)?.created_at || ''));
  const [saving, setSaving] = useState(false);
  const [galBusy, setGalBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const gallery = parseGallery(form.gallery);
  const setGallery = (arr: Media[]) => setForm((p) => ({ ...p, gallery: JSON.stringify(arr) }));

  /** Пачка файлов: грузим по очереди, видео определяем по MIME. */
  const addFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setGalBusy(true);
    try {
      const uploaded: Media[] = [];
      for (const f of Array.from(files)) {
        const url = await adminApi.uploadFile(f);
        uploaded.push({ type: f.type.startsWith('video') ? 'video' : 'image', url });
      }
      setGallery([...gallery, ...uploaded]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setGalBusy(false);
    }
  };
  const removeMedia = (i: number) => setGallery(gallery.filter((_, j) => j !== i));
  const moveMedia = (from: number, to: number) => {
    if (to < 0 || to >= gallery.length || from === to) return;
    const next = [...gallery];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setGallery(next);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setCheck = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.checked }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, created_at: publishAt ? new Date(publishAt).toISOString() : null };
      if (form.id) await adminApi.updateNews(form.id, payload);
      else await adminApi.createNews(payload);
      onSave();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-ink [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-muted [&_select]:min-h-11 [&_select]:rounded-xl [&_select]:border [&_select]:border-line [&_select]:bg-white [&_select]:px-3 [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea:focus]:border-ink">
      <div className="grid max-w-sm gap-2">
        <label>Рубрика</label>
        <select
          value={form.tag_ru || NEWS_CATEGORIES[0].ru}
          onChange={(e) => {
            const ru = e.target.value;
            const en = NEWS_CATEGORIES.find((c) => c.ru === ru)?.en || ru;
            setForm((p) => ({ ...p, tag_ru: ru, tag_en: en }));
          }}
        >
          {NEWS_CATEGORIES.map((c) => (
            <option key={c.ru} value={c.ru}>{c.ru}</option>
          ))}
        </select>
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
        label="Главное изображение статьи"
        value={form.image}
        onChange={(url) => setForm((p) => ({ ...p, image: url }))}
      />

      <div className="grid gap-2">
        <label>Медиа новости (фото и видео)</label>
        <span className="text-[11px] normal-case tracking-normal text-muted">
          Можно выбрать несколько файлов сразу. Перетащите карточки, чтобы изменить порядок, или используйте стрелки.
        </span>
        <div className="flex flex-wrap gap-3">
          {gallery.map((m, i) => (
            <div
              key={`${m.url}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) moveMedia(dragIndex, i);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`group relative h-28 w-36 cursor-move overflow-hidden rounded-lg border bg-ink ${dragIndex === i ? 'border-accent opacity-60' : 'border-line'}`}
            >
              {m.type === 'video' ? (
                <>
                  <video src={m.url} className="h-full w-full object-cover" muted preload="metadata" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper">▶</span>
                  </span>
                  <span className="absolute left-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-paper">видео</span>
                </>
              ) : (
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              )}

              {/* Порядковый номер */}
              <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-paper">
                {i + 1}
              </span>

              {/* Управление: влево / вправо / удалить */}
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveMedia(i, i - 1)}
                  disabled={i === 0}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-white disabled:opacity-30"
                  aria-label="Левее"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => moveMedia(i, i + 1)}
                  disabled={i === gallery.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-white disabled:opacity-30"
                  aria-label="Правее"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-sm text-white"
                  aria-label="Удалить"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <label className="flex h-28 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line bg-paper text-xs font-semibold text-ink transition hover:border-ink">
            {galBusy ? 'Загрузка…' : '+ Фото / видео'}
            <span className="text-[10px] font-normal text-muted">можно пачкой</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid max-w-xs gap-2">
        <label>Дата и время публикации</label>
        <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
        <span className="text-[11px] normal-case tracking-normal text-muted">
          Если оставить пустым — текущие дата и время. Эта дата показывается в новости.
        </span>
      </div>

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
