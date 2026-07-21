import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  name_ru: '', name_en: '',
  capacity: '', area: '',
  features_ru: '', features_en: '',
  description_ru: '', description_en: '',
  image: '',
  gallery: '',
  scheme: '',
  schemes: '',
  equipment_ru: '', equipment_en: '',
  equipment_blocks: '',
  rider_only: false,
  sort_order: 0,
};

/** Блок оборудования: текст на двух языках + необязательная картинка (открывается
 *  в лайтбоксе на сайте). Хранится JSON-массивом в поле equipment_blocks. */
interface EqBlock {
  text_ru: string;
  text_en: string;
  image: string;
}

/** Парсим блоки оборудования: сначала из JSON equipment_blocks, иначе — из
 *  легаси-строк equipment_ru/en (по строке на пункт, без картинок). */
function parseEqBlocks(item: typeof EMPTY | null): EqBlock[] {
  try {
    const a = JSON.parse((item?.equipment_blocks as string) || '[]');
    if (Array.isArray(a) && a.length) {
      return a
        .filter((x) => x && typeof x === 'object')
        .map((x) => ({ text_ru: String(x.text_ru || ''), text_en: String(x.text_en || ''), image: String(x.image || '') }));
    }
  } catch {
    /* fallthrough */
  }
  const ru = String(item?.equipment_ru || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const en = String(item?.equipment_en || '').split('\n').map((s) => s.trim()).filter(Boolean);
  return ru.map((t, i) => ({ text_ru: t, text_en: en[i] || '', image: '' }));
}

/** URL-ы фото зала хранятся JSON-массивом в поле gallery. */
function parseUrls(raw: string): string[] {
  try {
    const a = JSON.parse(raw || '[]');
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Особенность зала: заголовок + текст на двух языках. */
interface Feature {
  title_ru: string;
  title_en: string;
  text_ru: string;
  text_en: string;
}

/** Особенности хранятся JSON-массивом в поле features_ru.
 *  Если там лежит легаси-строка (старый формат) — начинаем с пустого списка. */
function parseFeatures(raw: string): Feature[] {
  try {
    const a = JSON.parse(raw || '[]');
    if (!Array.isArray(a)) return [];
    return a
      .filter((x) => x && typeof x === 'object')
      .map((x) => ({
        title_ru: String(x.title_ru || ''),
        title_en: String(x.title_en || ''),
        text_ru: String(x.text_ru || ''),
        text_en: String(x.text_en || ''),
      }));
  } catch {
    return [];
  }
}

export default function AdminHalls() {
  return (
    <AdminCrudPage
      title="Залы"
      subtitle="КОЛОННЫЙ · ОКТЯБРЬСКИЙ"
      columns={[
        { key: 'name_ru', label: 'Название (RU)' },
        { key: 'capacity', label: 'Вместимость' },
        { key: 'area', label: 'Площадь' },
        { key: 'features_ru', label: 'Особенностей', render: (r: typeof EMPTY) => String(parseFeatures(r.features_ru).length) },
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
  const [features, setFeatures] = useState<Feature[]>(() => parseFeatures((item as typeof EMPTY)?.features_ru || ''));
  const [equipment, setEquipment] = useState<EqBlock[]>(() => parseEqBlocks(item as typeof EMPTY | null));
  const [saving, setSaving] = useState(false);
  const [galBusy, setGalBusy] = useState(false);
  const [schemeBusy, setSchemeBusy] = useState(false);
  const [eqImgBusy, setEqImgBusy] = useState<number | null>(null);

  // Блоки оборудования (отдельные записи, как «Зрителям»). У каждого — RU/EN
  // текст и необязательная картинка (клик по блоку на сайте открывает фото).
  const addEqBlock = () => setEquipment((p) => [...p, { text_ru: '', text_en: '', image: '' }]);
  const removeEqBlock = (i: number) => setEquipment((p) => p.filter((_, j) => j !== i));
  const setEqField = (i: number, key: keyof EqBlock, value: string) =>
    setEquipment((p) => p.map((b, j) => (j === i ? { ...b, [key]: value } : b)));
  const uploadEqImage = async (i: number, file: File | undefined) => {
    if (!file) return;
    setEqImgBusy(i);
    try {
      const url = await adminApi.uploadFile(file);
      setEqField(i, 'image', url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setEqImgBusy(null);
    }
  };

  // Схемы зала: несколько вариаций (JSON-массив в поле schemes). Для обратной
  // совместимости fallback на легаси-поле scheme; при сохранении scheme = первая.
  const MAX_HALL_SCHEMES = 10;
  const schemes = (() => {
    const fromField = parseUrls(form.schemes || '');
    return fromField.length ? fromField : form.scheme ? [form.scheme] : [];
  })();
  const setSchemes = (arr: string[]) =>
    setForm((p) => ({ ...p, schemes: JSON.stringify(arr), scheme: arr[0] || '' }));
  const addScheme = async (file: File | undefined) => {
    if (!file) return;
    if (schemes.length >= MAX_HALL_SCHEMES) {
      alert(`Можно загрузить не более ${MAX_HALL_SCHEMES} схем.`);
      return;
    }
    setSchemeBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      setSchemes([...schemes, url]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setSchemeBusy(false);
    }
  };
  const removeScheme = (i: number) => setSchemes(schemes.filter((_, j) => j !== i));

  const MAX_HALL_PHOTOS = 10;
  const gallery = parseUrls(form.gallery);
  const setGallery = (arr: string[]) => setForm((p) => ({ ...p, gallery: JSON.stringify(arr) }));
  const addImage = async (file: File | undefined) => {
    if (!file) return;
    if (gallery.length >= MAX_HALL_PHOTOS) {
      alert(`Можно загрузить не более ${MAX_HALL_PHOTOS} фото зала.`);
      return;
    }
    setGalBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      setGallery([...gallery, url]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setGalBusy(false);
    }
  };
  const removeImage = (i: number) => setGallery(gallery.filter((_, j) => j !== i));

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const addFeature = () =>
    setFeatures((p) => [...p, { title_ru: '', title_en: '', text_ru: '', text_en: '' }]);
  const removeFeature = (i: number) => setFeatures((p) => p.filter((_, j) => j !== i));
  const setFeature = (i: number, key: keyof Feature, value: string) =>
    setFeatures((p) => p.map((f, j) => (j === i ? { ...f, [key]: value } : f)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Особенности пишем JSON-массивом в features_ru; features_en больше не используем.
      const clean = features.filter((f) => f.title_ru || f.title_en || f.text_ru || f.text_en);
      // Оборудование: блоки → JSON equipment_blocks; для легаси-совместимости
      // дублируем тексты в equipment_ru/en (по строке на пункт).
      const eqClean = equipment.filter((b) => b.text_ru || b.text_en || b.image);
      const eqRu = eqClean.map((b) => b.text_ru).filter(Boolean).join('\n');
      const eqEn = eqClean.map((b) => b.text_en).filter(Boolean).join('\n');
      // Главное фото = первое из галереи (для превью/SEO).
      const payload = {
        ...form,
        features_ru: JSON.stringify(clean),
        features_en: '',
        equipment_blocks: JSON.stringify(eqClean),
        equipment_ru: eqRu,
        equipment_en: eqEn,
        image: gallery[0] || '',
        schemes: JSON.stringify(schemes),
        scheme: schemes[0] || '',
      };
      if (form.id) await adminApi.updateHall(form.id, payload);
      else await adminApi.createHall(payload);
      onSave();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-zinc-200 [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-accent [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-zinc-500 [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-zinc-200 [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea:focus]:border-accent">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Название (RU)</label>
          <input value={form.name_ru} onChange={set('name_ru')} required placeholder="Колонный зал" />
        </div>
        <div className="grid gap-2">
          <label>Name (EN)</label>
          <input value={form.name_en} onChange={set('name_en')} required placeholder="Hall of Columns" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Вместимость</label>
          <input value={form.capacity} onChange={set('capacity')} placeholder="1 200 мест" />
        </div>
        <div className="grid gap-2">
          <label>Площадь</label>
          <input value={form.area} onChange={set('area')} placeholder="1 120 м²" />
        </div>
      </div>

      {/* ОСОБЕННОСТИ — repeatable список «заголовок + текст» (RU/EN). */}
      <div className="grid gap-3 rounded-2xl border border-line bg-paper-soft p-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Особенности</label>
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
          >
            <Plus size={13} /> Добавить
          </button>
        </div>

        {features.length === 0 ? (
          <p className="py-2 text-sm text-muted">Пока нет особенностей. Нажмите «Добавить».</p>
        ) : (
          <div className="grid gap-4">
            {features.map((f, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-line bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">№ {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700"
                  >
                    <Trash2 size={12} /> Удалить
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={f.title_ru} onChange={(e) => setFeature(i, 'title_ru', e.target.value)} placeholder="Заголовок (RU) — напр. «Акустика»" />
                  <input value={f.title_en} onChange={(e) => setFeature(i, 'title_en', e.target.value)} placeholder="Title (EN) — e.g. «Acoustics»" />
                  <input value={f.text_ru} onChange={(e) => setFeature(i, 'text_ru', e.target.value)} placeholder="Текст (RU) — напр. «Класс A»" />
                  <input value={f.text_en} onChange={(e) => setFeature(i, 'text_en', e.target.value)} placeholder="Text (EN) — e.g. «Class A»" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Описание (RU)</label>
          <textarea value={form.description_ru} onChange={set('description_ru')} rows={5} />
        </div>
        <div className="grid gap-2">
          <label>Description (EN)</label>
          <textarea value={form.description_en} onChange={set('description_en')} rows={5} />
        </div>
      </div>

      <div className="grid gap-2">
        <label>Фото зала (до {MAX_HALL_PHOTOS} — на странице листаются слайдером)</label>
        <div className="flex flex-wrap gap-3">
          {gallery.map((url, i) => (
            <div key={i} className="relative h-24 w-32 overflow-hidden rounded-lg border border-line">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white">Главное</span>
              ) : null}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-sm text-white"
                aria-label="Удалить"
              >
                ×
              </button>
            </div>
          ))}
          {gallery.length < MAX_HALL_PHOTOS ? (
            <label className="flex h-24 w-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-paper text-xs font-semibold text-ink transition hover:border-ink">
              {galBusy ? '…' : '+ Фото'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => addImage(e.target.files?.[0])} />
            </label>
          ) : null}
        </div>
      </div>

      {/* СХЕМЫ — планы/рассадки зала: можно несколько вариаций (листаются слайдером). */}
      <div className="grid gap-2">
        <label>Схемы зала (план / рассадка — до {MAX_HALL_SCHEMES}, на странице листаются слайдером)</label>
        <div className="flex flex-wrap gap-3">
          {schemes.map((url, i) => (
            <div key={i} className="relative h-28 w-40 overflow-hidden rounded-lg border border-line bg-white">
              <img src={url} alt="" className="h-full w-full object-contain p-1" />
              <button
                type="button"
                onClick={() => removeScheme(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-sm text-white"
                aria-label="Удалить"
              >
                ×
              </button>
            </div>
          ))}
          {schemes.length < MAX_HALL_SCHEMES ? (
            <label className="flex h-28 w-40 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-paper text-xs font-semibold text-ink transition hover:border-ink">
              {schemeBusy ? '…' : '+ Схема'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => addScheme(e.target.files?.[0])} />
            </label>
          ) : null}
        </div>
      </div>

      {/* ОБОРУДОВАНИЕ — отдельные блоки (как «Зрителям»). У каждого блока —
          RU/EN текст и необязательная картинка (клик по блоку на сайте
          открывает фото в модальном окне). */}
      <div className="grid gap-3 rounded-2xl border border-line bg-paper-soft p-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Оборудование (блоки)</label>
          <button
            type="button"
            onClick={addEqBlock}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
          >
            <Plus size={13} /> Добавить
          </button>
        </div>

        {equipment.length === 0 ? (
          <p className="py-2 text-sm text-muted">Пока нет блоков. Нажмите «Добавить».</p>
        ) : (
          <div className="grid gap-4">
            {equipment.map((b, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-line bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">№ {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEqBlock(i)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700"
                  >
                    <Trash2 size={12} /> Удалить
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={b.text_ru} onChange={(e) => setEqField(i, 'text_ru', e.target.value)} placeholder="Название (RU) — напр. «Рояль Steinway & Sons»" />
                  <input value={b.text_en} onChange={(e) => setEqField(i, 'text_en', e.target.value)} placeholder="Title (EN) — e.g. «Steinway & Sons grand piano»" />
                </div>
                {/* Картинка блока — необязательная. */}
                <div className="flex flex-wrap items-center gap-3">
                  {b.image ? (
                    <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-line bg-white">
                      <img src={b.image} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEqField(i, 'image', '')}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-sm text-white"
                        aria-label="Удалить картинку"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                  <label className="flex h-24 w-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-paper text-xs font-semibold text-ink transition hover:border-ink">
                    {eqImgBusy === i ? '…' : b.image ? '+ Заменить' : '+ Фото'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadEqImage(i, e.target.files?.[0])} />
                  </label>
                  <span className="text-[11px] text-muted">Необязательно. Если задать — блок на сайте открывает это фото в модальном окне.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ФЛАГ — буфет/анфилада: только в тех. райдере, не на странице «Залы». */}
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-paper-soft p-3">
        <input
          type="checkbox"
          checked={!!form.rider_only}
          onChange={(e) => setForm((p) => ({ ...p, rider_only: e.target.checked }))}
          className="h-4 w-4 accent-ink"
        />
        <span className="text-[12px] font-semibold text-ink">
          Только в техническом райдере (буфет, анфилада) — не показывать как отдельный зал на странице «Залы»
        </span>
      </label>

      <div className="grid max-w-32 gap-2">
        <label>Порядок</label>
        <input type="number" value={form.sort_order} onChange={set('sort_order')} />
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
