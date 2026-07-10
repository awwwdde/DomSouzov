import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ShieldCheck, KeyRound } from 'lucide-react';
import { adminApi } from '../../api/client';

/* ============================================================ */
/* АДМИНИСТРАТОРЫ — управление учётками (только супер-админ).     */
/* Супер-админ создаёт/удаляет обычных админов; у обычных те же  */
/* права на контент, но без доступа к этому разделу.             */
/* ============================================================ */

interface Admin {
  id: number;
  email: string;
  is_active: boolean;
  is_super: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .getAdmins()
      .then((data: Admin[]) => setAdmins(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await adminApi.createAdmin(email.trim(), password);
      setEmail('');
      setPassword('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать админа');
    } finally {
      setCreating(false);
    }
  };

  const resetPassword = async (a: Admin) => {
    const pwd = window.prompt(`Новый пароль для ${a.email} (мин. 6 символов):`);
    if (pwd === null) return; // отмена
    if (pwd.length < 6) {
      alert('Пароль должен быть не короче 6 символов');
      return;
    }
    try {
      await adminApi.resetAdminPassword(a.id, pwd);
      alert(`Пароль для ${a.email} обновлён`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось сбросить пароль');
    }
  };

  const remove = async (a: Admin) => {
    if (!confirm(`Удалить админа ${a.email}?`)) return;
    try {
      await adminApi.deleteAdmin(a.id);
      setAdmins((prev) => prev.filter((x) => x.id !== a.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при удалении');
    }
  };

  return (
    <motion.div
      className="grid gap-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">ДОСТУП · УЧЁТНЫЕ ЗАПИСИ</div>
        <h1 className="mt-2 font-heading text-[clamp(30px,4vw,44px)] font-semibold uppercase leading-[0.86] tracking-[-0.06em]">Администраторы</h1>
      </div>

      {/* Создание нового админа */}
      <form
        onSubmit={create}
        className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto] md:items-end [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-zinc-200 [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input:focus]:border-accent [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.14em] [&_label]:text-zinc-500"
      >
        <div className="grid gap-2">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@dom-soyuzov.ru" />
        </div>
        <div className="grid gap-2">
          <label>Пароль (мин. 6 символов)</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="надёжный пароль" />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent bg-accent px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60"
        >
          <Plus size={14} />
          {creating ? 'Создание…' : 'Создать админа'}
        </button>
        {error ? <p className="text-sm text-red-700 md:col-span-3">{error}</p> : null}
      </form>

      {/* Список админов */}
      {loading ? (
        <div className="text-sm text-muted">Загрузка…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr className="border-b border-line last:border-b-0" key={a.id}>
                  <td className="px-4 py-3 align-middle">{a.email}</td>
                  <td className="px-4 py-3 align-middle">
                    {a.is_super ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
                        <ShieldCheck size={13} /> Супер-админ
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Админ</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => resetPassword(a)}
                        className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink"
                      >
                        <KeyRound size={12} /> Сбросить пароль
                      </button>
                      {!a.is_super ? (
                        <button
                          onClick={() => remove(a)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700"
                        >
                          <Trash2 size={12} /> Удалить
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
