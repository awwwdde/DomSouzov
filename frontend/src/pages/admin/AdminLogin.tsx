import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 text-ink shadow-2xl">
        <div className="font-heading text-5xl font-semibold uppercase leading-none tracking-[-0.04em]">ДОМ СОЮЗОВ</div>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">ADMIN · CMS</div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <div className="grid gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">EMAIL</label>
            <input
              className="min-h-11 rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">ПАРОЛЬ / PASSWORD</label>
            <input
              className="min-h-11 rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-ink bg-ink px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60" disabled={loading}>
            {loading ? 'ВХОД...' : 'ВОЙТИ →'}
          </button>
        </form>
      </div>
    </div>
  );
}
