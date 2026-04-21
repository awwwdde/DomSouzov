import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMe, adminLogout } from '../../api/client';

const NAV = [
  { path: '/admin', label: 'Дашборд', icon: '⬛' },
  { path: '/admin/events', label: 'Мероприятия', icon: '◈' },
  { path: '/admin/news', label: 'Хроники', icon: '◉' },
  { path: '/admin/halls', label: 'Залы', icon: '◧' },
  { path: '/admin/gallery', label: 'Галерея', icon: '◻' },
  { path: '/admin/settings', label: 'Настройки', icon: '◎' },
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
    <div className="admin-shell">
      <motion.aside
        className="admin-sidebar"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-brand">
          <div className="admin-brand-logo serif">ДОМ СОЮЗОВ</div>
          <div className="admin-brand-sub mono">CMS · ADMIN</div>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item${location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)) ? ' active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <Link to="/" target="_blank" className="admin-view-site mono">
            ↗ ОТКРЫТЬ САЙТ
          </Link>
          <div className="admin-user mono">{email}</div>
          <button className="admin-logout-btn mono" onClick={handleLogout}>
            ВЫЙТИ
          </button>
        </div>
      </motion.aside>

      <motion.main
        className="admin-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
