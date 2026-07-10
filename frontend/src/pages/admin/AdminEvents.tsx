import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import RichTextArea from '../../components/admin/RichTextArea';
import { adminApi } from '../../api/client';
import { EVENT_CATEGORIES } from '../../lib/categories';

const EMPTY = {
  id: 0,
  title_ru: '', title_en: '',
  date: '', date_en: '',
  time: '',
  weekday_ru: '', weekday_en: '',
  dates: '',  // JSON-массив сеансов (мультидаты)
  hall_ru: 'Колонный зал', hall_en: 'Hall of Columns',
  tag_ru: '', tag_en: '',
  price_ru: '', price_en: '',
  description_ru: '', description_en: '',
  image: '',
  image_vertical: '',
  has_ticket: false,
  ticket_url: '',
  age_rating: '',
  is_featured: false,
  is_lead: false,
  is_active: true,
  sort_order: 0,
  created_at: '',
};

const AGE_OPTIONS = ['', '0+', '6+', '12+', '16+', '18+'];

const CATEGORIES = EVENT_CATEGORIES;

// ── Мультидаты: форматирование сеансов из ISO (<input type="date">) ──────────
const RU_MON = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
const EN_MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const RU_WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const EN_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Occ = { date: string; date_en: string; time: string; weekday_ru: string; weekday_en: string };

/** ISO "YYYY-MM-DD" + время → объект сеанса с RU/EN-датой и днём недели. */
function occFromISO(iso: string, time: string): Occ | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (mo < 0 || mo > 11) return null;
  const dt = new Date(y, mo, d);
  return {
    date: `${d} ${RU_MON[mo]} ${y}`,
    date_en: `${d} ${EN_MON[mo]} ${y}`,
    time: (time || '').trim(),
    weekday_ru: RU_WD[dt.getDay()],
    weekday_en: EN_WD[dt.getDay()],
  };
}

/** Время сортировки сеанса по его EN-дате ("20 DEC 2025"). */
function occSortKey(o: Occ): number {
  const m = o.date_en.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!m) return 0;
  const mi = EN_MON.indexOf(m[2].toUpperCase());
  const t = (o.time || '00:00').padStart(5, '0');
  return new Date(Number(m[3]), mi < 0 ? 0 : mi, Number(m[1])).getTime() + (Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)));
}

function parseOccs(s: string): Occ[] {
  try {
    const a = JSON.parse(s || '[]');
    return Array.isArray(a) ? a.filter((x) => x && typeof x === 'object' && x.date) : [];
  } catch {
    return [];
  }
}

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
  const [form, setForm] = useState(() => {
    const base = { ...EMPTY, ...(item as typeof EMPTY || {}) };
    if (!base.tag_ru) {
      base.tag_ru = CATEGORIES[0].ru;
      base.tag_en = CATEGORIES[0].en;
    }
    return base;
  });
  const [saving, setSaving] = useState(false);

  // ── Мультидаты (расписание сеансов) ──────────────────────────────
  const occurrences = parseOccs(form.dates);
  const setOccurrences = (arr: Occ[]) => {
    const sorted = [...arr].sort((a, b) => occSortKey(a) - occSortKey(b));
    setForm((p) => {
      const next = { ...p, dates: sorted.length ? JSON.stringify(sorted) : '' };
      // Первый сеанс синхронизируем с основными полями (для SEO/сортировки/карточек).
      if (sorted.length) {
        const f = sorted[0];
        next.date = f.date;
        next.date_en = f.date_en;
        next.time = f.time || p.time;
        next.weekday_ru = f.weekday_ru || p.weekday_ru;
        next.weekday_en = f.weekday_en || p.weekday_en;
      }
      return next;
    });
  };
  // Режим «мультидата»: при включении верхние поля даты блокируются —
  // дата берётся только из расписания (первый сеанс).
  const [multi, setMulti] = useState(occurrences.length > 0);
  const toggleMulti = (on: boolean) => {
    setMulti(on);
    if (!on) setOccurrences([]); // выключили — возвращаемся к одиночной дате
  };

  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [periodTimes, setPeriodTimes] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [singleTime, setSingleTime] = useState('');

  const addPeriod = () => {
    const sm = periodStart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const em = periodEnd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!sm || !em) return;
    const times = periodTimes.split(',').map((s) => s.trim()).filter(Boolean);
    if (!times.length) times.push('');
    let cur = new Date(Number(sm[1]), Number(sm[2]) - 1, Number(sm[3]));
    const end = new Date(Number(em[1]), Number(em[2]) - 1, Number(em[3]));
    if (cur > end) return;
    const added: Occ[] = [];
    let guard = 0;
    while (cur <= end && guard < 400) {
      const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      for (const t of times) {
        const o = occFromISO(iso, t);
        if (o) added.push(o);
      }
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
      guard++;
    }
    setOccurrences([...occurrences, ...added]);
    setPeriodStart('');
    setPeriodEnd('');
    setPeriodTimes('');
  };

  const addSingle = () => {
    const o = occFromISO(singleDate, singleTime);
    if (o) setOccurrences([...occurrences, o]);
    setSingleDate('');
    setSingleTime('');
  };

  const removeOcc = (i: number) => setOccurrences(occurrences.filter((_, j) => j !== i));

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
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-zinc-200 [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input:focus]:border-accent [&_input:disabled]:bg-paper-soft [&_input:disabled]:text-muted [&_input:disabled]:cursor-not-allowed [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-zinc-500 [&_select]:min-h-11 [&_select]:rounded-xl [&_select]:border [&_select]:border-line [&_select]:bg-white [&_select]:px-3 [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-zinc-200 [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea:focus]:border-accent">
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

      {multi ? (
        <div className="rounded-xl border border-dashed border-line bg-paper-soft px-4 py-3 text-[12px] normal-case tracking-normal text-muted">
          Включена мультидата — дата, время и день недели берутся из расписания ниже (первый сеанс). Поля выше отключены.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Дата (RU, напр. «19 ИЮН 2026»)</label>
          <input value={form.date} onChange={set('date')} required={!multi} disabled={multi} placeholder="19 ИЮН 2026" />
        </div>
        <div className="grid gap-2">
          <label>Date (EN, e.g. «19 JUN 2026»)</label>
          <input value={form.date_en} onChange={set('date_en')} required={!multi} disabled={multi} placeholder="19 JUN 2026" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Время (напр. «19:30»)</label>
          <input value={form.time} onChange={set('time')} required={!multi} disabled={multi} placeholder="19:30" />
        </div>
        <div className="grid gap-2">
          <label>День недели RU / EN (напр. «Пт» / «Fri»)</label>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.weekday_ru} onChange={set('weekday_ru')} disabled={multi} placeholder="Пт" />
            <input value={form.weekday_en} onChange={set('weekday_en')} disabled={multi} placeholder="Fri" />
          </div>
        </div>
      </div>

      {/* ── Мультидаты / расписание сеансов ──────────────────────────── */}
      <div className="grid gap-4 rounded-2xl border border-line bg-paper-soft p-4">
        <label className="flex cursor-pointer items-start gap-2.5 normal-case tracking-normal">
          <input
            type="checkbox"
            checked={multi}
            onChange={(e) => toggleMulti(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          />
          <span>
            <span className="text-sm font-bold uppercase tracking-[0.08em] text-ink">Мультидата (несколько дат / сеансов)</span>
            <span className="mt-1 block text-[11px] text-muted">
              Для мероприятий на несколько дней (напр. ёлка идёт 2 недели). При включении дата, время и день недели
              берутся из расписания ниже (первый сеанс), а поля даты вверху блокируются.
            </span>
          </span>
        </label>

        {multi ? (
          <>
        {/* Период: с — по + времена сеансов */}
        <div className="grid gap-3 rounded-xl border border-line bg-white p-3 md:grid-cols-[1fr_1fr_1.4fr_auto] md:items-end">
          <div className="grid gap-2">
            <label>Период: с</label>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label>по</label>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label>Время сеансов (через запятую)</label>
            <input value={periodTimes} onChange={(e) => setPeriodTimes(e.target.value)} placeholder="12:00, 16:00" />
          </div>
          <button
            type="button"
            onClick={addPeriod}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent bg-accent px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
          >
            + Период
          </button>
        </div>

        {/* Отдельная дата */}
        <div className="grid gap-3 rounded-xl border border-line bg-white p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="grid gap-2">
            <label>Отдельная дата</label>
            <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label>Время</label>
            <input value={singleTime} onChange={(e) => setSingleTime(e.target.value)} placeholder="19:00" />
          </div>
          <button
            type="button"
            onClick={addSingle}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink"
          >
            + Дата
          </button>
        </div>

        {/* Список добавленных сеансов */}
        {occurrences.length > 0 ? (
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                Сеансов: {occurrences.length}
              </span>
              <button
                type="button"
                onClick={() => setOccurrences([])}
                className="text-[11px] font-semibold uppercase tracking-[0.1em] text-red-700"
              >
                Очистить всё
              </button>
            </div>
            <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
              {occurrences.map((o, i) => (
                <span
                  key={`${o.date}-${o.time}-${i}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink"
                >
                  <span className="font-semibold">{o.date}</span>
                  {o.time ? <span className="tabular-nums text-muted">{o.time}</span> : null}
                  <button
                    type="button"
                    onClick={() => removeOcc(i)}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/90 text-sm leading-none text-white"
                    aria-label="Удалить дату"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}
          </>
        ) : null}
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
          value={form.tag_ru || CATEGORIES[0].ru}
          onChange={(e) => {
            const ru = e.target.value;
            const en = CATEGORIES.find((c) => c.ru === ru)?.en || ru;
            setForm((p) => ({ ...p, tag_ru: ru, tag_en: en }));
          }}
        >
          {form.tag_ru && !CATEGORIES.some((c) => c.ru === form.tag_ru) ? (
            <option value={form.tag_ru}>{form.tag_ru} (старая категория)</option>
          ) : null}
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
          <RichTextArea value={form.description_ru} onChange={(v) => setForm((p) => ({ ...p, description_ru: v }))} rows={5} />
        </div>
        <div className="grid gap-2">
          <label>Description (EN)</label>
          <RichTextArea value={form.description_en} onChange={(v) => setForm((p) => ({ ...p, description_en: v }))} rows={5} />
        </div>
      </div>
      <span className="-mt-3 text-[11px] normal-case tracking-normal text-muted">
        Кнопка «Фото в текст» вставляет изображение прямо в описание на месте курсора — например, логотипы партнёров в конце.
      </span>

      <div className="grid gap-4 md:grid-cols-2">
        <ImageUpload
          label="Фото для Афиши (горизонтальное)"
          value={form.image}
          onChange={(url) => setForm((p) => ({ ...p, image: url }))}
        />
        <ImageUpload
          label="Фото для главной (вертикальное)"
          value={form.image_vertical}
          onChange={(url) => setForm((p) => ({ ...p, image_vertical: url }))}
        />
      </div>
      <p className="-mt-2 text-xs leading-5 text-muted">
        Горизонтальное фото показывается на странице «Афиша», вертикальное — в карточке на главной.
        Если вертикальное не задано, на главной используется горизонтальное.
      </p>

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
          <input type="checkbox" checked={form.is_lead} onChange={setCheck('is_lead')} />
          Лид (первый в Афише на главной)
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
        <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-full border border-accent bg-accent px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60" disabled={saving}>
          {saving ? 'Сохранение...' : 'СОХРАНИТЬ →'}
        </button>
        <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-full border border-line bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]" onClick={onCancel}>ОТМЕНА</button>
      </div>
    </form>
  );
}
