import { useState } from 'react';
import AdminCrudPage from '../../components/admin/AdminCrudPage';
import ImageUpload from '../../components/admin/ImageUpload';
import { adminApi } from '../../api/client';

const EMPTY = {
  id: 0,
  name_ru: '',
  name_en: '',
  logo: '',
  url: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminPartners() {
  return (
    <AdminCrudPage
      title="Партнёры"
      subtitle="ЛОГОТИПЫ · ССЫЛКИ"
      columns={[
        {
          key: 'logo',
          label: 'Лого',
          render: (r: typeof EMPTY) =>
            r.logo ? (
              <img src={r.logo} className="h-[40px] w-auto max-w-[100px] object-contain" alt="" />
            ) : (
              <span className="text-xs text-muted">—</span>
            ),
        },
        { key: 'name_ru', label: 'Название (RU)' },
        { key: 'url', label: 'URL' },
        { key: 'sort_order', label: 'Порядок' },
        { key: 'is_active', label: 'Активно', render: (r: typeof EMPTY) => (r.is_active ? '✓' : '✗') },
      ]}
      fetchFn={adminApi.getPartners}
      deleteFn={adminApi.deletePartner}
      renderForm={(item, onSave, onCancel) => <PartnerForm item={item} onSave={onSave} onCancel={onCancel} />}
    />
  );
}

function PartnerForm({ item, onSave, onCancel }: { item: unknown; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...EMPTY, ...(item as typeof EMPTY || {}) });
  const [saving, setSaving] = useState(false);

  const setField = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
        logo: form.logo || null,
      };
      if (form.id) await adminApi.updatePartner(form.id, payload);
      else await adminApi.createPartner(payload);
      onSave();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-zinc-200 [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input:focus]:border-accent [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-zinc-500">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label>Название (RU)</label>
          <input value={form.name_ru} onChange={setField('name_ru')} required />
        </div>
        <div className="grid gap-2">
          <label>Name (EN)</label>
          <input value={form.name_en} onChange={setField('name_en')} required />
        </div>
      </div>
      <ImageUpload label="Логотип" value={form.logo} onChange={(url) => setForm((p) => ({ ...p, logo: url }))} />
      <div className="grid gap-2">
        <label>Сайт партнёра (https://…)</label>
        <input value={form.url} onChange={setField('url')} placeholder="https://example.org" type="url" />
        <span className="text-[11px] text-muted">Клик по логотипу на сайте откроет эту ссылку в новой вкладке.</span>
      </div>
      <div className="grid max-w-[200px] gap-2">
        <label>Порядок</label>
        <input value={String(form.sort_order)} onChange={setField('sort_order')} type="number" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_active} onChange={setField('is_active')} />
        Активен на сайте
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
          {saving ? '…' : 'Сохранить'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-line px-6 py-3 text-xs font-bold uppercase tracking-[0.12em]">
          Отмена
        </button>
      </div>
    </form>
  );
}
