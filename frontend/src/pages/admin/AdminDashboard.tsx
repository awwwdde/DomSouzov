import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/client';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ events: 0, news: 0, halls: 0, gallery: 0 });

  useEffect(() => {
    Promise.all([
      adminApi.getEvents(),
      adminApi.getNews(),
      adminApi.getHalls(),
      adminApi.getGallery(),
    ]).then(([events, news, halls, gallery]) => {
      setCounts({ events: events.length, news: news.length, halls: halls.length, gallery: gallery.length });
    }).catch(() => {});
  }, []);

  const stats = [
    { label: 'Мероприятия', num: counts.events, to: '/admin/events' },
    { label: 'Хроники', num: counts.news, to: '/admin/news' },
    { label: 'Залы', num: counts.halls, to: '/admin/halls' },
    { label: 'Галерея', num: counts.gallery, to: '/admin/gallery' },
  ];

  const quickLinks = [
    { label: '+ Новое мероприятие', to: '/admin/events' },
    { label: '+ Новая статья', to: '/admin/news' },
    { label: '+ Загрузить фото', to: '/admin/gallery' },
    { label: '⚙ Настройки сайта', to: '/admin/settings' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sub">CMS · CONTROL PANEL</div>
          <h1>Дашборд</h1>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {stats.map((s, index) => (
          <motion.div
            key={s.to}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <Link to={s.to} className="admin-card-link">
              <div className="admin-stat-card">
              <div className="num">{s.num}</div>
              <div className="label">{s.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="admin-dashboard-bottom">
        <div className="admin-panel">
          <div className="admin-panel-title mono">
            БЫСТРЫЕ ДЕЙСТВИЯ
          </div>
          <div className="admin-actions-list">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="btn admin-quick-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-panel admin-panel-soft">
          <div className="admin-panel-title mono">
            СТРУКТУРА CMS
          </div>
          <ul className="admin-structure-list">
            <li>— <strong>Мероприятия</strong>: концерты, события, даты, цены</li>
            <li>— <strong>Хроники</strong>: новости, статьи, интервью</li>
            <li>— <strong>Залы</strong>: Колонный, Октябрьский</li>
            <li>— <strong>Галерея</strong>: фотографии и медиа</li>
            <li>— <strong>Настройки</strong>: тексты, адрес, контакты</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
