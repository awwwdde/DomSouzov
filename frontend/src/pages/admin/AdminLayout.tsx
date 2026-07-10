import { Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMe, adminLogout } from '../../api/client';
import {
  BookOpen, CalendarDays, Cog, ExternalLink, GalleryHorizontal, Handshake, Inbox,
  LayoutDashboard, Landmark, LogOut, Menu, MessageSquareQuote, Newspaper, Users, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = { path: string; label: string; icon: LucideIcon };

// Навигация сгруппирована по смыслу — так проще ориентироваться.
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Обзор',
    items: [{ path: '/admin', label: 'Дашборд', icon: LayoutDashboard }],
  },
  {
    title: 'Контент',
    items: [
      { path: '/admin/events', label: 'Мероприятия', icon: CalendarDays },
      { path: '/admin/news', label: 'Архив мероприятий', icon: Newspaper },
      { path: '/admin/halls', label: 'Залы', icon: Landmark },
      { path: '/admin/gallery', label: 'Галерея', icon: GalleryHorizontal },
      { path: '/admin/about', label: 'О Доме', icon: BookOpen },
      { path: '/admin/partners', label: 'Партнёры', icon: Handshake },
    ],
  },
  {
    title: 'Взаимодействие',
    items: [
      { path: '/admin/reviews', label: 'Отзывы', icon: MessageSquareQuote },
      { path: '/admin/requests', label: 'Заявки', icon: Inbox },
    ],
  },
  {
    title: 'Система',
    items: [{ path: '/admin/settings', label: 'Настройки', icon: Cog }],
  },
];

// Пункт только для супер-админа (добавляется в группу «Система»).
const SUPER_ITEM: NavItem = { path: '/admin/users', label: 'Администраторы', icon: Users };

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSuper, setIsSuper] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    getMe()
      .then((me) => {
        setEmail(me.email);
        setIsSuper(Boolean(me.is_super));
      })
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  // На мобильном меню сворачивается; закрываем его при переходе.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const groups = NAV_GROUPS.map((g) =>
    g.title === 'Система' && isSuper ? { ...g, items: [...g.items, SUPER_ITEM] } : g
  );

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  const NavList = () => (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
      {groups.map((group) => (
        <div key={group.title}>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
            {group.title}
          </div>
          <div className="grid gap-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                    active
                      ? 'bg-accent text-white shadow-[0_6px_16px_-8px_rgba(31,95,78,0.6)]'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.9}
                    className={active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Brand = () => (
    <Link to="/admin" className="flex items-center gap-2.5">
      <img src="/logo-house.svg" alt="Дом Союзов" className="h-9 w-auto" />
      <div className="leading-none">
        <div className="font-heading text-lg font-bold uppercase tracking-[0.01em] text-zinc-900">
          Дом Союзов
        </div>
        <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-accent">
          CMS · Admin
        </div>
      </div>
    </Link>
  );

  const Footer = () => (
    <div className="border-t border-zinc-200 p-3">
      <Link
        to="/"
        target="_blank"
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
      >
        <ExternalLink size={16} strokeWidth={1.9} className="text-zinc-400" />
        Открыть сайт
      </Link>
      <div className="mt-2 flex items-center gap-2.5 rounded-xl px-3 py-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-[12px] font-bold uppercase text-accent">
          {email ? email[0] : '·'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold text-zinc-800">{email || '—'}</div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Администратор</div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Выйти"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 md:grid md:grid-cols-[264px_1fr]">
      {/* --- Мобильная шапка --- */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
        <Brand />
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 text-zinc-700"
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={navOpen}
        >
          {navOpen ? <X size={18} strokeWidth={1.9} /> : <Menu size={18} strokeWidth={1.9} />}
        </button>
      </div>

      {/* --- Десктоп-сайдбар --- */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="p-5">
          <Brand />
        </div>
        <NavList />
        <Footer />
      </aside>

      {/* --- Мобильный выезжающий сайдбар --- */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Закрыть меню"
              className="fixed inset-0 z-40 bg-zinc-900/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-zinc-200 bg-white md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between p-5">
                <Brand />
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 text-zinc-700"
                  onClick={() => setNavOpen(false)}
                  aria-label="Закрыть"
                >
                  <X size={18} strokeWidth={1.9} />
                </button>
              </div>
              <NavList />
              <Footer />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-9">
        {/* Локальный Suspense: при переключении вкладок перерисовывается только
            контент, а сайдбар остаётся на месте — без «моргания». */}
        <Suspense fallback={<div className="text-sm text-zinc-400">Загрузка…</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
