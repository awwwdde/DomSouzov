import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';

/* ============================================================ */
/* «ДОМ В КАДРАХ» — управление фотографиями секции на /about.    */
/* Раскладка (колонки, параллакс, момент появления) назначается  */
/* автоматически по пресетам, чтобы админу достаточно было       */
/* просто загрузить снимок и подписать его.                      */
/* ============================================================ */

interface Photo {
  id: number;
  image: string;
  caption_ru: string;
  caption_en: string;
  col_start: number;
  col_span: number;
  offset_y: number;
  parallax_speed: number;
  reveal_progress: number;
  sort_order: number;
  is_active: boolean;
}

/** Пресеты раскладки — крутятся по кругу по мере добавления фото. */
const LAYOUT_PRESETS = [
  { col_start: 1, col_span: 5, offset_y: 0, parallax_speed: 0.15, reveal_progress: 0.1 },
  { col_start: 8, col_span: 4, offset_y: 80, parallax_speed: -0.25, reveal_progress: 0.25 },
  { col_start: 3, col_span: 6, offset_y: 220, parallax_speed: 0.1, reveal_progress: 0.4 },
  { col_start: 9, col_span: 4, offset_y: 360, parallax_speed: -0.2, reveal_progress: 0.55 },
  { col_start: 1, col_span: 4, offset_y: 500, parallax_speed: 0.05, reveal_progress: 0.7 },
  { col_start: 7, col_span: 5, offset_y: 620, parallax_speed: -0.15, reveal_progress: 0.85 },
];

export default function AdminAbout() {
  return (
    <div className="grid gap-16">
      <PhotosManager />
      <TimelineManager />
    </div>
  );
}

function PhotosManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .getAboutPhotos()
      .then((data: Photo[]) => setPhotos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addPhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      const preset = LAYOUT_PRESETS[photos.length % LAYOUT_PRESETS.length];
      await adminApi.createAboutPhoto({
        image: url,
        caption_ru: '',
        caption_en: '',
        sort_order: photos.length + 1,
        is_active: true,
        ...preset,
      });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setBusy(false);
    }
  };

  const patch = (id: number, key: keyof Photo, value: string | number) =>
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));

  const savePhoto = async (p: Photo) => {
    setSavingId(p.id);
    try {
      await adminApi.updateAboutPhoto(p.id, p);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSavingId(null);
    }
  };

  const removePhoto = async (id: number) => {
    if (!confirm('Удалить фотографию?')) return;
    try {
      await adminApi.deleteAboutPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Ошибка при удалении');
    }
  };

  return (
    <motion.div
      className="grid gap-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">О ДОМЕ · СЕКЦИЯ ФОТО</div>
          <h1 className="mt-2 font-heading text-[clamp(48px,7vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.06em]">Дом в кадрах</h1>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
          <Plus size={14} />
          {busy ? 'Загрузка…' : 'Добавить фото'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => addPhoto(e.target.files?.[0])} />
        </label>
      </div>

      <p className="max-w-2xl text-sm leading-6 text-muted">
        Загрузите снимки — они появятся в секции «Дом в кадрах» на странице «О Доме».
        Расположение и эффект параллакса подбираются автоматически; порядком можно управлять полем «Порядок».
      </p>

      {loading ? (
        <div className="text-sm text-muted">Загрузка…</div>
      ) : photos.length === 0 ? (
        <div className="py-10 text-sm text-muted">Пока нет фотографий. Нажмите «Добавить фото».</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="grid gap-3 rounded-3xl border border-line bg-white p-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-paper-soft">
                {p.image ? (
                  <img src={p.image} alt={p.caption_ru} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">нет изображения</div>
                )}
              </div>
              <div className="grid gap-2">
                <input
                  className="min-h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink"
                  value={p.caption_ru}
                  onChange={(e) => patch(p.id, 'caption_ru', e.target.value)}
                  placeholder="Подпись (RU)"
                />
                <input
                  className="min-h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink"
                  value={p.caption_en}
                  onChange={(e) => patch(p.id, 'caption_en', e.target.value)}
                  placeholder="Caption (EN)"
                />
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Порядок</label>
                  <input
                    type="number"
                    className="min-h-10 w-24 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink"
                    value={p.sort_order}
                    onChange={(e) => patch(p.id, 'sort_order', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => savePhoto(p)}
                  disabled={savingId === p.id}
                  className="rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-60"
                >
                  {savingId === p.id ? '…' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700"
                >
                  <Trash2 size={12} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ============================================================ */
/* ХРОНОЛОГИЯ — управление событиями таймлайна на /about.        */
/* ============================================================ */

interface TimelineItem {
  id: number;
  year: string;
  tag_ru: string;
  tag_en: string;
  title_ru: string;
  title_en: string;
  description_ru: string;
  description_en: string;
  image: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_TL: TimelineItem = {
  id: 0, year: '', tag_ru: '', tag_en: '', title_ru: '', title_en: '',
  description_ru: '', description_en: '', image: '', sort_order: 0, is_active: true,
};

function TimelineManager() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .getAboutTimeline()
      .then((data: TimelineItem[]) => setItems(data.map((d) => ({ ...EMPTY_TL, ...d }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const addDraft = () => setItems((p) => [...p, { ...EMPTY_TL, sort_order: p.length + 1 }]);

  const patch = (idx: number, key: keyof TimelineItem, value: string | number) =>
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));

  const save = async (idx: number) => {
    const it = items[idx];
    setSavingId(it.id || 'new');
    try {
      if (it.id) await adminApi.updateAboutTimeline(it.id, it);
      else await adminApi.createAboutTimeline(it);
      load();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (idx: number) => {
    const it = items[idx];
    if (!it.id) {
      setItems((p) => p.filter((_, i) => i !== idx));
      return;
    }
    if (!confirm('Удалить событие хронологии?')) return;
    try {
      await adminApi.deleteAboutTimeline(it.id);
      setItems((p) => p.filter((_, i) => i !== idx));
    } catch {
      alert('Ошибка при удалении');
    }
  };

  const uploadImage = async (idx: number, file: File | undefined) => {
    if (!file) return;
    try {
      const url = await adminApi.uploadFile(file);
      patch(idx, 'image', url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
  };

  return (
    <motion.div className="grid gap-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">О ДОМЕ · ХРОНОЛОГИЯ</div>
          <h2 className="mt-2 font-heading text-[clamp(36px,5vw,72px)] font-semibold uppercase leading-[0.86] tracking-[-0.05em]">Хронология</h2>
        </div>
        <button type="button" onClick={addDraft} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
          <Plus size={14} /> Добавить событие
        </button>
      </div>

      <p className="max-w-2xl text-sm leading-6 text-muted">
        События на странице «О Доме». Дата — свободный текст (год или «Март 2026»). Тег — необязательная метка над датой.
      </p>

      {loading ? (
        <div className="text-sm text-muted">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="py-6 text-sm text-muted">Пока нет событий. Нажмите «Добавить событие».</div>
      ) : (
        <div className="grid gap-4">
          {items.map((it, idx) => (
            <div
              key={it.id || `new-${idx}`}
              className="grid gap-3 rounded-3xl border border-line bg-white p-4 [&_input]:min-h-10 [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_input:focus]:border-ink [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:outline-none [&_textarea:focus]:border-ink"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <input value={it.year} onChange={(e) => patch(idx, 'year', e.target.value)} placeholder="Дата (напр. 1784)" />
                <input value={it.tag_ru} onChange={(e) => patch(idx, 'tag_ru', e.target.value)} placeholder="Тег (RU)" />
                <input value={it.tag_en} onChange={(e) => patch(idx, 'tag_en', e.target.value)} placeholder="Tag (EN)" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input value={it.title_ru} onChange={(e) => patch(idx, 'title_ru', e.target.value)} placeholder="Заголовок (RU)" />
                <input value={it.title_en} onChange={(e) => patch(idx, 'title_en', e.target.value)} placeholder="Title (EN)" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <textarea rows={3} value={it.description_ru} onChange={(e) => patch(idx, 'description_ru', e.target.value)} placeholder="Описание (RU)" />
                <textarea rows={3} value={it.description_en} onChange={(e) => patch(idx, 'description_en', e.target.value)} placeholder="Description (EN)" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {it.image ? <img src={it.image} alt="" className="h-16 w-24 rounded-lg object-cover" /> : null}
                <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 text-[11px] font-semibold uppercase tracking-[0.1em]">
                  {it.image ? 'Заменить фото' : 'Загрузить фото'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(idx, e.target.files?.[0])} />
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Порядок</span>
                  <input type="number" className="w-20" value={it.sort_order} onChange={(e) => patch(idx, 'sort_order', Number(e.target.value))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => save(idx)} disabled={savingId !== null} className="rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-60">
                  {savingId === (it.id || 'new') ? '…' : 'Сохранить'}
                </button>
                <button type="button" onClick={() => remove(idx)} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700">
                  <Trash2 size={12} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
