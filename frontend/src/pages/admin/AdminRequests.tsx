import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Loader2, Mail, MailX, Paperclip, Phone, RefreshCw, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';

/* ============================================================ */
/* ЗАЯВКИ — обращения с формы «Организаторам».                   */
/* Список всех заявок (помимо письма на почту): просмотр,        */
/* редактирование полей и удаление.                              */
/* ============================================================ */

interface RequestItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  emailed: boolean;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminRequests() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .getOrganizerRequests()
      .then((data: RequestItem[]) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const patch = (id: number, key: keyof RequestItem, value: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)));

  const save = async (it: RequestItem) => {
    setSavingId(it.id);
    try {
      await adminApi.updateOrganizerRequest(it.id, {
        name: it.name,
        email: it.email,
        phone: it.phone,
        message: it.message,
      });
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить заявку безвозвратно?')) return;
    try {
      await adminApi.deleteOrganizerRequest(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      alert('Ошибка при удалении');
    }
  };

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">ОРГАНИЗАТОРАМ · ФОРМА</div>
          <h1 className="mt-2 font-heading text-[clamp(40px,6vw,80px)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
            Заявки
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Обращения с формы «Оставить заявку» на странице «Организаторам». Здесь видны все заявки —
            даже если письмо на почту не дошло. Поля можно отредактировать или удалить заявку.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-line bg-white px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:border-ink"
        >
          <RefreshCw size={14} /> Обновить
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> Загрузка…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line bg-white py-16 text-center">
          <Inbox size={28} className="text-muted" />
          <div className="text-sm text-muted">Заявок пока нет.</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="grid gap-3 rounded-3xl border border-line bg-white p-5 [&_input]:min-h-10 [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_input:focus]:border-ink [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:outline-none [&_textarea:focus]:border-ink"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Заявка #{it.id}</span>
                  <span className="text-xs text-muted">{fmtDate(it.created_at)}</span>
                </div>
                <span
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
                    it.emailed ? 'bg-accent/10 text-accent' : 'bg-paper text-muted',
                  ].join(' ')}
                  title={it.emailed ? 'Письмо отправлено на почту' : 'Письмо не отправлено (сохранено только здесь)'}
                >
                  {it.emailed ? <Mail size={12} /> : <MailX size={12} />}
                  {it.emailed ? 'Письмо ушло' : 'Без письма'}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Имя</span>
                  <input value={it.name} onChange={(e) => patch(it.id, 'name', e.target.value)} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Email</span>
                  <input value={it.email} onChange={(e) => patch(it.id, 'email', e.target.value)} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Телефон</span>
                  <input value={it.phone} onChange={(e) => patch(it.id, 'phone', e.target.value)} />
                </label>
              </div>

              <label className="grid gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Сообщение</span>
                <textarea rows={3} value={it.message} onChange={(e) => patch(it.id, 'message', e.target.value)} />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${it.email}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-paper px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:border-ink"
                >
                  <Mail size={13} /> Ответить
                </a>
                {it.phone ? (
                  <a
                    href={`tel:${it.phone}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-paper px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:border-ink"
                  >
                    <Phone size={13} /> Позвонить
                  </a>
                ) : null}
                {it.attachment_url ? (
                  <a
                    href={it.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    download={it.attachment_name || undefined}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-paper px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:border-ink"
                    title={it.attachment_name || 'Вложение'}
                  >
                    <Paperclip size={13} /> Файл
                  </a>
                ) : null}
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => save(it)}
                  disabled={savingId === it.id}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-ink bg-ink px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition disabled:opacity-60"
                >
                  {savingId === it.id ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-200 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700 transition hover:border-red-400"
                >
                  <Trash2 size={13} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
