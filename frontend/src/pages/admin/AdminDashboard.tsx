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
    { label: 'Настройки сайта', to: '/admin/settings' },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">CMS · CONTROL PANEL</div>
          <h1 className="mt-2 font-heading text-[clamp(52px,7vw,104px)] font-semibold uppercase leading-[0.84] tracking-[-0.06em]">Дашборд</h1>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {stats.map((s, index) => (
          <motion.div
            key={s.to}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <Link to={s.to} className="block">
              <div className="grid min-h-40 content-between rounded-3xl border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-ink/25">
              <div className="font-heading text-7xl font-semibold leading-none">{s.num}</div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{s.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            БЫСТРЫЕ ДЕЙСТВИЯ
          </div>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-full border border-line bg-paper px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition hover:border-ink/30 hover:bg-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            СТРУКТУРА CMS
          </div>
          <ul className="space-y-2 text-sm leading-6 text-ink-soft">
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
