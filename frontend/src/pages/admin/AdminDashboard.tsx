import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        {stats.map((s) => (
          <Link key={s.to} to={s.to} style={{ textDecoration: 'none', color: 'var(--ink)' }}>
            <div className="admin-stat-card">
              <div className="num">{s.num}</div>
              <div className="label">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
            БЫСТРЫЕ ДЕЙСТВИЯ
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="btn" style={{ display: 'inline-flex' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px', border: '1px solid var(--ink)', background: 'var(--paper-2)' }}>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
            СТРУКТУРА CMS
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', lineHeight: 2, color: 'var(--ink-2)' }}>
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
