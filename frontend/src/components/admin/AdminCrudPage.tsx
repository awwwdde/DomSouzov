import { useState, useEffect, ReactNode } from 'react';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface AdminCrudPageProps<T extends { id: number }> {
  title: string;
  subtitle: string;
  columns: Column<T>[];
  fetchFn: () => Promise<T[]>;
  deleteFn: (id: number) => Promise<unknown>;
  renderForm: (item: T | null, onSave: () => void, onCancel: () => void) => ReactNode;
  emptyText?: string;
}

export default function AdminCrudPage<T extends { id: number }>({
  title,
  subtitle,
  columns,
  fetchFn,
  deleteFn,
  renderForm,
  emptyText = 'Нет записей',
}: AdminCrudPageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null | 'new'>('none' as unknown as null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetchFn()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить запись?')) return;
    setDeleting(id);
    try {
      await deleteFn(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert('Ошибка при удалении');
    } finally {
      setDeleting(null);
    }
  };

  const getVal = (row: T, key: string): ReactNode => {
    const val = (row as Record<string, unknown>)[key];
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? <Check size={14} /> : <X size={14} />;
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if ('ru' in obj) return String(obj.ru);
    }
    return String(val);
  };

  if (editing !== 'none' as unknown) {
    return (
      <div className="grid gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{subtitle}</div>
            <h1 className="mt-2 font-heading text-[clamp(48px,7vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.06em]">{editing === null ? 'Новая запись' : 'Редактировать'}</h1>
          </div>
          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]" onClick={() => setEditing('none' as unknown as null)}>
            <ArrowLeft size={14} />
            Назад
          </button>
        </div>
        <div className="rounded-3xl border border-line bg-white p-5">
          {renderForm(
          editing === null ? null : editing as T,
          () => { load(); setEditing('none' as unknown as null); },
          () => setEditing('none' as unknown as null)
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{subtitle}</div>
          <h1 className="mt-2 font-heading text-[clamp(48px,7vw,96px)] font-semibold uppercase leading-[0.86] tracking-[-0.06em]">{title}</h1>
        </div>
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white" onClick={() => setEditing(null)}>
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted">Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-sm text-muted">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-white">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                {columns.map((col) => (
                  <th className="px-4 py-3" key={String(col.key)}>{col.label}</th>
                ))}
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr className="border-b border-line last:border-b-0" key={row.id}>
                  {columns.map((col) => (
                    <td className="px-4 py-3 align-top" key={String(col.key)}>
                      {col.render ? col.render(row) : getVal(row, String(col.key))}
                    </td>
                  ))}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]" onClick={() => setEditing(row)}>Изменить</button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700"
                        onClick={() => handleDelete(row.id)}
                        disabled={deleting === row.id}
                      >
                        {deleting === row.id ? '...' : 'Удалить'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
