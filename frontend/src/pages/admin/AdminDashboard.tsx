import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, Newspaper, Landmark, GalleryHorizontal, Plus, Image as ImageIcon,
  Cog, ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

  const stats: { label: string; num: number; to: string; icon: LucideIcon }[] = [
    { label: 'Мероприятия', num: counts.events, to: '/admin/events', icon: CalendarDays },
    { label: 'Архив мероприятий', num: counts.news, to: '/admin/news', icon: Newspaper },
    { label: 'Залы', num: counts.halls, to: '/admin/halls', icon: Landmark },
    { label: 'Галерея', num: counts.gallery, to: '/admin/gallery', icon: GalleryHorizontal },
  ];

  const quickLinks: { label: string; to: string; icon: LucideIcon }[] = [
    { label: 'Новое мероприятие', to: '/admin/events', icon: Plus },
    { label: 'Новая статья', to: '/admin/news', icon: Newspaper },
    { label: 'Загрузить фото', to: '/admin/gallery', icon: ImageIcon },
    { label: 'Настройки сайта', to: '/admin/settings', icon: Cog },
  ];

  return (
    <div className="grid gap-7">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Панель управления</div>
        <h1 className="mt-1.5 font-heading text-[clamp(30px,4vw,44px)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-zinc-900">
          Дашборд
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Обзор контента сайта Дома Союзов.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, index) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={s.to}
                className="group flex flex-col justify-between gap-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-accent/40 hover:shadow-[0_12px_30px_-16px_rgba(31,95,78,0.4)]"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icon size={19} strokeWidth={1.9} />
                  </div>
                  <ArrowUpRight size={18} className="text-zinc-300 transition group-hover:text-accent" />
                </div>
                <div>
                  <div className="font-heading text-5xl font-semibold leading-none tracking-[-0.02em] text-zinc-900">
                    {s.num}
                  </div>
                  <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    {s.label}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">Быстрые действия</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[13px] font-semibold text-zinc-700 transition hover:border-accent/40 hover:bg-white hover:text-accent"
                >
                  <Icon size={16} strokeWidth={2} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">Структура CMS</div>
          <ul className="mt-4 space-y-2.5 text-sm leading-6 text-zinc-600">
            <li className="flex gap-2"><span className="text-accent">•</span> <span><strong className="font-semibold text-zinc-900">Мероприятия</strong> — концерты, события, даты, цены</span></li>
            <li className="flex gap-2"><span className="text-accent">•</span> <span><strong className="font-semibold text-zinc-900">Архив мероприятий</strong> — новости, статьи, интервью</span></li>
            <li className="flex gap-2"><span className="text-accent">•</span> <span><strong className="font-semibold text-zinc-900">Залы</strong> — Колонный, Октябрьский и др.</span></li>
            <li className="flex gap-2"><span className="text-accent">•</span> <span><strong className="font-semibold text-zinc-900">Галерея</strong> — фотографии и медиа</span></li>
            <li className="flex gap-2"><span className="text-accent">•</span> <span><strong className="font-semibold text-zinc-900">Настройки</strong> — тексты, адрес, контакты</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
