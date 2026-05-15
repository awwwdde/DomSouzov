import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMe, adminLogout } from '../../api/client';
import { CalendarDays, Cog, ExternalLink, GalleryHorizontal, Handshake, LayoutDashboard, Landmark, Newspaper } from 'lucide-react';

const NAV = [
  { path: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { path: '/admin/events', label: 'Мероприятия', icon: CalendarDays },
  { path: '/admin/news', label: 'Хроники', icon: Newspaper },
  { path: '/admin/halls', label: 'Залы', icon: Landmark },
  { path: '/admin/gallery', label: 'Галерея', icon: GalleryHorizontal },
  { path: '/admin/partners', label: 'Партнёры', icon: Handshake },
  { path: '/admin/settings', label: 'Настройки', icon: Cog },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    getMe()
      .then((me) => setEmail(me.email))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white md:grid md:grid-cols-[280px_1fr]">
      <motion.aside
        className="sticky top-0 z-30 flex h-auto flex-col border-b border-white/10 bg-neutral-950 p-5 md:h-screen md:border-b-0 md:border-r"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <div className="font-heading text-4xl font-semibold uppercase leading-none tracking-[-0.04em]">ДОМ СОЮЗОВ</div>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">CMS · ADMIN</div>
        </div>

        <nav className="mt-8 grid gap-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${active ? 'bg-white text-ink' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                <span><Icon size={14} strokeWidth={1.8} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 grid gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55 md:mt-auto">
          <Link to="/" target="_blank" className="inline-flex items-center gap-2 transition hover:text-white">
            <ExternalLink size={12} strokeWidth={2} />
            ОТКРЫТЬ САЙТ
          </Link>
          <div className="truncate">{email}</div>
          <button className="justify-self-start text-white/55 transition hover:text-white" onClick={handleLogout}>
            ВЫЙТИ
          </button>
        </div>
      </motion.aside>

      <motion.main
        className="min-w-0 bg-paper p-5 text-ink md:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
