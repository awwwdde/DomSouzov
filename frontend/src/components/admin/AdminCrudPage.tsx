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
    if (val === null || val === undefined) return <span className="text-zinc-300">—</span>;
    if (typeof val === 'boolean')
      return val ? <Check size={15} className="text-accent" /> : <X size={15} className="text-zinc-300" />;
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if ('ru' in obj) return String(obj.ru);
    }
    return String(val);
  };

  const Header = ({ heading, right }: { heading: string; right: ReactNode }) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{subtitle}</div>
        <h1 className="mt-1.5 font-heading text-[clamp(30px,4vw,44px)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-zinc-900">
          {heading}
        </h1>
      </div>
      {right}
    </div>
  );

  if (editing !== ('none' as unknown)) {
    return (
      <div className="grid gap-7">
        <Header
          heading={editing === null ? 'Новая запись' : 'Редактировать'}
          right={
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-50"
              onClick={() => setEditing('none' as unknown as null)}
            >
              <ArrowLeft size={15} />
              Назад
            </button>
          }
        />
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:p-6">
          {renderForm(
            editing === null ? null : (editing as T),
            () => {
              load();
              setEditing('none' as unknown as null);
            },
            () => setEditing('none' as unknown as null)
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-7">
      <Header
        heading={title}
        right={
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-[13px] font-semibold text-white transition hover:bg-accent-deep"
            onClick={() => setEditing(null)}
          >
            <Plus size={16} />
            Добавить
          </button>
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-400">
          Загрузка…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-400">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  {columns.map((col) => (
                    <th className="px-5 py-3.5" key={String(col.key)}>
                      {col.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr className="border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50/60" key={row.id}>
                    {columns.map((col) => (
                      <td className="px-5 py-3.5 align-middle text-zinc-700" key={String(col.key)}>
                        {col.render ? col.render(row) : getVal(row, String(col.key))}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-700 transition hover:bg-zinc-50"
                          onClick={() => setEditing(row)}
                        >
                          Изменить
                        </button>
                        <button
                          className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          onClick={() => handleDelete(row.id)}
                          disabled={deleting === row.id}
                        >
                          {deleting === row.id ? '…' : 'Удалить'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
