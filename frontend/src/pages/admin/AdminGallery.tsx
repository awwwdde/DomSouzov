import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus, Trash2, Upload, Pencil, Star, Images } from 'lucide-react';
import { adminApi } from '../../api/client';

type Category = {
  id: number;
  slug: string;
  name_ru: string;
  name_en: string;
  cover_image?: string | null;
  cover_video?: string | null;
  sort_order: number;
};

type Photo = {
  id: number;
  image: string;
  caption_ru?: string | null;
  caption_en?: string | null;
  category_id?: number | null;
  category_ru?: string;
  category_en?: string;
  is_active?: boolean;
  sort_order?: number;
};

export default function AdminGallery() {
  const [cats, setCats] = useState<Category[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([adminApi.getGalleryCategories(), adminApi.getGallery()]);
      setCats(c);
      setPhotos(p);
      setActiveId((prev) => prev ?? (c[0]?.id ?? null));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const active = useMemo(() => cats.find((c) => c.id === activeId) || null, [cats, activeId]);
  const activePhotos = useMemo(
    () => photos.filter((p) => p.category_id === activeId).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [photos, activeId],
  );
  const countByCat = (id: number) => photos.filter((p) => p.category_id === id).length;

  const addBlock = async () => {
    const name_ru = window.prompt('Название блока (RU):', '')?.trim();
    if (!name_ru) return;
    const name_en = window.prompt('Название (EN):', name_ru)?.trim() || name_ru;
    const created = await adminApi.createGalleryCategory({ name_ru, name_en, sort_order: cats.length });
    await load();
    setActiveId(created.id);
  };

  const renameBlock = async (c: Category) => {
    const name_ru = window.prompt('Название блока (RU):', c.name_ru)?.trim();
    if (!name_ru) return;
    const name_en = window.prompt('Название (EN):', c.name_en)?.trim() || c.name_en;
    await adminApi.updateGalleryCategory(c.id, { ...c, name_ru, name_en });
    await load();
  };

  const deleteBlock = async (c: Category) => {
    if (!window.confirm(`Удалить блок «${c.name_ru}» вместе со всеми фото?`)) return;
    await adminApi.deleteGalleryCategory(c.id);
    if (activeId === c.id) setActiveId(null);
    await load();
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || !active) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await adminApi.uploadFile(file);
        await adminApi.createGallery({
          image: url,
          caption_ru: '',
          caption_en: '',
          category_id: active.id,
          category_ru: active.name_ru,
          category_en: active.name_en,
          is_active: true,
          sort_order: 0,
        });
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deletePhoto = async (p: Photo) => {
    await adminApi.deleteGallery(p.id);
    setPhotos((prev) => prev.filter((x) => x.id !== p.id));
  };

  const setCover = async (p: Photo) => {
    if (!active) return;
    // Ставим фото обложкой и снимаем видео-обложку (приоритет у видео на фронте).
    await adminApi.updateGalleryCategory(active.id, { ...active, cover_image: p.image, cover_video: null });
    setCats((prev) => prev.map((c) => (c.id === active.id ? { ...c, cover_image: p.image, cover_video: null } : c)));
  };

  /** Отдельная загрузка обложки блока: картинка или видео. */
  const uploadCover = async (file: File | null | undefined) => {
    if (!file || !active) return;
    setCoverBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      const isVideo = file.type.startsWith('video/');
      const patch = isVideo ? { cover_video: url } : { cover_image: url, cover_video: null };
      await adminApi.updateGalleryCategory(active.id, { ...active, ...patch });
      setCats((prev) => prev.map((c) => (c.id === active.id ? { ...c, ...patch } : c)));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setCoverBusy(false);
      if (coverRef.current) coverRef.current.value = '';
    }
  };

  const clearCoverVideo = async () => {
    if (!active) return;
    await adminApi.updateGalleryCategory(active.id, { ...active, cover_video: null });
    setCats((prev) => prev.map((c) => (c.id === active.id ? { ...c, cover_video: null } : c)));
  };

  const saveCaption = async (p: Photo, value: string) => {
    if ((p.caption_ru || '') === value) return;
    await adminApi.updateGallery(p.id, { ...p, caption_ru: value });
    setPhotos((prev) => prev.map((x) => (x.id === p.id ? { ...x, caption_ru: value } : x)));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 size={14} className="animate-spin" /> Загрузка…
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[clamp(30px,4vw,44px)] font-semibold uppercase leading-[0.9] tracking-[-0.03em]">
            Галерея
          </h1>
          <p className="mt-2 text-sm text-ink-soft">Блоки-темы и фотографии внутри них.</p>
        </div>
        <button
          type="button"
          onClick={addBlock}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-accent bg-accent px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
        >
          <Plus size={15} /> Новый блок
        </button>
      </header>

      {/* Блоки-темы */}
      {cats.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          Блоков пока нет. Создайте первый — «Новый блок».
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cats.map((c) => {
            const cover = c.cover_image || photos.find((p) => p.category_id === c.id)?.image || '';
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={[
                  'group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl border text-left transition',
                  isActive ? 'border-accent ring-2 ring-accent ring-offset-2' : 'border-line hover:border-ink',
                ].join(' ')}
              >
                {cover ? (
                  <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-paper text-muted">
                    <Images size={26} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <div className="relative z-[1] p-3">
                  <div className="font-heading text-base font-bold uppercase tracking-[0.02em] text-white">{c.name_ru}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">{countByCat(c.id)} фото</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Фото выбранного блока */}
      {active ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-2xl font-bold uppercase tracking-[0.02em]">{active.name_ru}</h2>
              <button type="button" onClick={() => renameBlock(active)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink hover:border-ink" title="Переименовать">
                <Pencil size={13} />
              </button>
              <button type="button" onClick={() => deleteBlock(active)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink hover:border-error hover:text-error" title="Удалить блок">
                <Trash2 size={13} />
              </button>
            </div>
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-accent bg-accent px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Загрузка…' : 'Загрузить фото'}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadPhotos(e.target.files)} />
            </label>
          </div>

          {/* Обложка блока — отдельное поле (картинка или видео). Видео приоритетнее. */}
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-paper p-4">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-line bg-paper-soft">
              {active.cover_video ? (
                <video src={active.cover_video} muted autoPlay loop playsInline className="h-full w-full object-cover" />
              ) : active.cover_image ? (
                <img src={active.cover_image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted"><Images size={22} /></div>
              )}
            </div>
            <div className="grid gap-1.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Обложка блока {active.cover_video ? '· видео' : active.cover_image ? '· фото' : '· не задана'}
              </div>
              <p className="max-w-md text-xs text-ink-soft">
                Загрузите картинку или видео для обложки. Видео проигрывается на превью блока в галерее. Также можно выбрать любое фото ниже «звёздочкой».
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-accent bg-accent px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                  {coverBusy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {coverBusy ? 'Загрузка…' : 'Загрузить обложку'}
                  <input ref={coverRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => uploadCover(e.target.files?.[0])} />
                </label>
                {active.cover_video ? (
                  <button type="button" onClick={clearCoverVideo} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:border-error hover:text-error">
                    <Trash2 size={13} /> Убрать видео
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {activePhotos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper p-10 text-center text-sm text-muted">
              В этом блоке пока нет фото. Нажмите «Загрузить фото» (можно сразу несколько).
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {activePhotos.map((p) => {
                const isCover = active.cover_image === p.image;
                return (
                  <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-paper">
                    <div className="relative aspect-[4/3]">
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                      <div className="absolute right-2 top-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCover(p)}
                          className={['grid h-8 w-8 place-items-center rounded-full text-white transition', isCover ? 'bg-accent' : 'bg-ink/70 hover:bg-ink'].join(' ')}
                          title={isCover ? 'Обложка блока' : 'Сделать обложкой'}
                        >
                          <Star size={14} fill={isCover ? 'currentColor' : 'none'} />
                        </button>
                        <button type="button" onClick={() => deletePhoto(p)} className="grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-white transition hover:bg-error" title="Удалить фото">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <input
                      defaultValue={p.caption_ru || ''}
                      placeholder="Подпись (необязательно)"
                      onBlur={(e) => saveCaption(p, e.target.value)}
                      className="w-full border-t border-line bg-white px-3 py-2 text-xs outline-none focus:bg-paper-soft"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
