import { useState, useEffect, ReactNode } from 'react';

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
    if (typeof val === 'boolean') return val ? '✓' : '✗';
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if ('ru' in obj) return String(obj.ru);
    }
    return String(val);
  };

  if (editing !== 'none' as unknown) {
    return (
      <div className="admin-page">
        <div className="admin-page-head">
          <div>
            <div className="sub">{subtitle}</div>
            <h1>{editing === null ? 'Новая запись' : 'Редактировать'}</h1>
          </div>
          <button className="btn" onClick={() => setEditing('none' as unknown as null)}>← Назад</button>
        </div>
        {renderForm(
          editing === null ? null : editing as T,
          () => { load(); setEditing('none' as unknown as null); },
          () => setEditing('none' as unknown as null)
        )}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sub">{subtitle}</div>
          <h1>{title}</h1>
        </div>
        <button className="btn solid" onClick={() => setEditing(null)}>
          + Добавить
        </button>
      </div>

      {loading ? (
        <div className="mono" style={{ color: 'var(--muted)', fontSize: '13px' }}>Загрузка...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '40px 0', color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={String(col.key)}>{col.label}</th>
                ))}
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(row) : getVal(row, String(col.key))}
                    </td>
                  ))}
                  <td>
                    <div className="admin-table-actions">
                      <button className="btn-edit" onClick={() => setEditing(row)}>Изменить</button>
                      <button
                        className="btn-delete"
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
