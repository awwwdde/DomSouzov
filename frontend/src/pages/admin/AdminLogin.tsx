import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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

  const field =
    'min-h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-[15px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent focus:ring-4 focus:ring-accent/10';

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-100 px-5 py-10">
      {/* Мягкие декоративные пятна на фоне */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative w-full max-w-[420px]">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_60px_-24px_rgba(16,24,40,0.25)]">
          {/* Верхняя акцентная полоса */}
          <div className="h-1.5 w-full bg-accent" />

          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3">
              <img src="/logo-house.svg" alt="Дом Союзов" className="h-12 w-auto" />
              <div>
                <div className="font-heading text-2xl font-bold uppercase leading-none tracking-[0.01em] text-zinc-900">
                  Дом Союзов
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Панель управления
                </div>
              </div>
            </div>

            <h1 className="mt-8 text-xl font-bold text-zinc-900">Вход в систему</h1>
            <p className="mt-1.5 text-sm text-zinc-500">Введите данные администратора, чтобы продолжить.</p>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-600">Email</label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    className={field}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domsoyuzov.ru"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-[12px] font-semibold text-zinc-600">Пароль</label>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    className={field}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[14px] font-semibold text-white transition hover:bg-accent-deep focus-visible:ring-4 focus-visible:ring-accent/20 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Вход…
                  </>
                ) : (
                  <>
                    Войти <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-zinc-400">
          © {new Date().getFullYear()} Дом Союзов · CMS
        </p>
      </div>
    </div>
  );
}
