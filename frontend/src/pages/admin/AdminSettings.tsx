import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  FileCheck,
  FileText,
  Globe2,
  Home as HomeIcon,
  Image as ImageIcon,
  Images,
  Landmark,
  Loader2,
  MapPin,
  Newspaper,
  PanelBottom,
  Plus,
  Shield,
  Trash2,
  Upload,
  Users,
  Video,
  Search,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/client';
import { ICON_NAMES, getLucideIcon } from '../../lib/lucideIcons';

/* ------------------------------------------------------------------ */
/* Конфигурация: какие настройки относятся к каким страницам сайта.    */
/* Только те ключи, которые реально читаются фронтендом.               */
/* ------------------------------------------------------------------ */

type FieldType = 'text' | 'textarea' | 'image' | 'video' | 'file' | 'list';

/** Подполе одного элемента списка. По умолчанию двуязычное. */
type ListSubField = {
  key: string;
  label: string;
  multiline?: boolean;
  /** false → одно поле без RU/EN (номер, индекс). По умолчанию true. */
  bilingual?: boolean;
  /** 'image' → загрузка картинки; 'icon' → выбор иконки Lucide (строка-имя). */
  type?: 'text' | 'image' | 'icon';
};

type Field = {
  key: string;
  label: string;
  type: FieldType;
  /** Поле общее для RU и EN (телефоны, реквизиты, URL). */
  single?: boolean;
  /** Высота textarea, по умолчанию 4. */
  rows?: number;
  /** Подсказка под полем. */
  hint?: string;
  /** Только для type === 'list': структура одного элемента. */
  itemFields?: ListSubField[];
  /** Только для type === 'list': подпись «добавить новый элемент». */
  itemLabel?: string;
};

type PageSection = { title: string; fields: Field[] };

type PageDef = {
  id: string;
  label: string;
  /** Подпись на карточке в bento-сетке. */
  description: string;
  group: 'Страницы' | 'Документы' | 'Общее';
  /** Иконка для bento-карточки. */
  // Тип компонента-иконки из lucide-react. `size?: number` исключал
  // lucide-react@>=0.x с `size?: string | number`, билд падал TS2322.
  icon: LucideIcon;
  /** Расположение в bento: ширина и высота в ячейках сетки (1 или 2). */
  span?: { col?: 1 | 2; row?: 1 | 2 };
  /** Внутренний URL, на который ведёт эта страница (для ссылки «Открыть»). */
  href: string;
  sections: PageSection[];
};

/** Краткая hero-секция (только заголовок) для обычных страниц. */
const heroPair = (titleKey: string): PageSection => ({
  title: 'Hero страницы',
  fields: [
    { key: titleKey, label: 'Заголовок', type: 'text' },
  ],
});

const PAGES: PageDef[] = [
  {
    id: 'home',
    label: 'Главная',
    description: 'Hero, тексты блоков и баннеры.',
    group: 'Страницы',
    icon: HomeIcon,
    href: '/',
    span: { col: 2, row: 1 },
    sections: [
      {
        title: 'Hero — фоновое медиа',
        fields: [
          { key: 'hero_video_url', label: 'Фоновое видео', type: 'video', single: true, hint: 'Ссылка на mp4/webm или загрузка с компьютера.' },
          { key: 'hero_video_poster', label: 'Постер видео', type: 'image', single: true, hint: 'Показывается, пока видео загружается.' },
        ],
      },
      {
        title: 'Цитата-тезис под Hero',
        fields: [
          { key: 'home_thesis', label: 'Главная цитата', type: 'textarea', rows: 4 },
        ],
      },
      {
        title: 'Блок «Спланировать визит»',
        fields: [
          { key: 'home_plan_heading', label: 'Заголовок блока', type: 'text' },
          { key: 'home_plan_body', label: 'Описание блока', type: 'textarea', rows: 4 },
        ],
      },
      {
        title: 'Парные блоки «Организаторам / Зрителям»',
        fields: [
          { key: 'home_organizers_body', label: 'Описание «Организаторам»', type: 'textarea', rows: 3 },
          { key: 'home_visitors_body', label: 'Описание «Зрителям»', type: 'textarea', rows: 3 },
        ],
      },
      {
        title: 'Бегущая строка',
        fields: [
          {
            key: 'home_marquee',
            label: 'Элементы строки',
            type: 'list',
            itemLabel: 'Добавить элемент',
            itemFields: [{ key: 'text', label: 'Текст' }],
          },
        ],
      },
      {
        title: 'CTA-баннер',
        fields: [
          { key: 'cta_background_url', label: 'Фоновое изображение баннера', type: 'image', single: true },
        ],
      },
      {
        title: 'Промо-баннеры (блоки на главной)',
        fields: [
          {
            key: 'home_promos',
            label: 'Баннеры',
            type: 'list',
            itemLabel: 'Добавить баннер',
            itemFields: [
              { key: 'image', label: 'Изображение', type: 'image', bilingual: false },
              { key: 'title', label: 'Заголовок' },
              { key: 'text', label: 'Текст', multiline: true },
              { key: 'cta', label: 'Текст кнопки' },
              { key: 'link', label: 'Ссылка (куда ведёт)', bilingual: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'events',
    label: 'Афиша',
    description: 'Заголовок страницы.',
    group: 'Страницы',
    icon: Calendar,
    href: '/events',
    sections: [heroPair('events_title')],
  },
  {
    id: 'about',
    label: 'О Доме',
    description: 'Hero, введение и заголовки секций.',
    group: 'Страницы',
    icon: BookOpen,
    href: '/about',
    span: { col: 2, row: 1 },
    sections: [
      {
        title: 'Hero страницы',
        fields: [
          { key: 'about_hero_video_url', label: 'Фоновое видео', type: 'video', single: true },
          { key: 'about_hero_video_poster', label: 'Постер видео', type: 'image', single: true },
          { key: 'about_hero_title', label: 'Заголовок страницы', type: 'text' },
        ],
      },
      {
        title: 'Введение',
        fields: [
          { key: 'about_intro_text', label: 'Текст-введение', type: 'textarea', rows: 8, hint: 'Абзацы разделяйте пустой строкой. Слова из подсказок становятся ховером с медиа.' },
        ],
      },
      {
        title: 'Заголовки секций',
        fields: [
          { key: 'about_photos_heading', label: 'Заголовок «Архив»', type: 'text' },
          { key: 'about_timeline_heading', label: 'Заголовок «Хронология»', type: 'text' },
        ],
      },
      {
        title: 'Блок «В цифрах»',
        fields: [
          { key: 'about_facts_image', label: 'Фото здания', type: 'image', single: true, hint: 'Вырезанное здание на прозрачном фоне (PNG). «Выпирает» из тёмного блока с цифрами. Показывается на десктопе.' },
        ],
      },
    ],
  },
  {
    id: 'halls',
    label: 'Залы',
    description: 'Заголовок страницы.',
    group: 'Страницы',
    icon: Landmark,
    href: '/halls',
    sections: [heroPair('halls_title')],
  },
  {
    id: 'gallery',
    label: 'Галерея',
    description: 'Заголовок страницы.',
    group: 'Страницы',
    icon: Images,
    href: '/gallery',
    sections: [heroPair('gallery_title')],
  },
  {
    id: 'organizers',
    label: 'Организаторам',
    description: 'Hero, заголовки секций.',
    group: 'Страницы',
    icon: Briefcase,
    href: '/organizers',
    sections: [
      heroPair('organizers_title'),
      {
        title: 'Видео-презентация',
        fields: [
          { key: 'organizers_video_url', label: 'Видео', type: 'video', single: true, hint: 'Ссылка на mp4/webm или загрузка с компьютера. Показывается над кнопками PDF.' },
          { key: 'organizers_video_poster', label: 'Постер видео', type: 'image', single: true, hint: 'Кадр, который виден до запуска видео.' },
        ],
      },
      {
        title: 'Короткий текст под кнопками',
        fields: [
          { key: 'organizers_note', label: 'Пояснение к кнопкам', type: 'textarea', rows: 3, hint: 'Кратко: что делать организатору (скачать райдер / отправить запрос).' },
        ],
      },
      {
        title: 'Форма заявки',
        fields: [
          { key: 'organizers_form_email', label: 'Email для заявок', type: 'text', single: true, hint: 'Сюда приходят заявки из модального окна «Оставить заявку». Если пусто — используется email из настроек «Контакты». Отправку писем включает SMTP в окружении сервера.' },
        ],
      },
      {
        title: 'Документы (PDF — открываются в новой вкладке)',
        fields: [
          { key: 'organizers_rider_pdf', label: 'Технический райдер (PDF)', type: 'file', single: true, hint: 'Кнопка «Просмотреть технический райдер».' },
          { key: 'organizers_halls_pdf', label: 'Презентация залов (PDF)', type: 'file', single: true, hint: 'Кнопка «Залы». Если пусто — кнопка ведёт на страницу /halls.' },
        ],
      },
    ],
  },
  {
    id: 'audience',
    label: 'Зрителям',
    description: 'Hero и заголовок FAQ.',
    group: 'Страницы',
    icon: Users,
    href: '/audience',
    sections: [
      heroPair('audience_title'),
      {
        title: 'Правила нахождения (карточки)',
        fields: [
          {
            key: 'audience_items',
            label: 'Правила',
            type: 'list',
            itemLabel: 'Добавить правило',
            itemFields: [
              { key: 'icon', label: 'Иконка', type: 'icon', bilingual: false },
              { key: 'title', label: 'Заголовок' },
              { key: 'desc', label: 'Описание', multiline: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'news',
    label: 'Новости',
    description: 'Заголовок страницы.',
    group: 'Страницы',
    icon: Newspaper,
    href: '/news',
    sections: [heroPair('news_title')],
  },
  {
    id: 'contacts',
    label: 'Контакты',
    description: 'Адрес, часы, связь.',
    group: 'Страницы',
    icon: MapPin,
    href: '/contacts',
    span: { col: 2, row: 1 },
    sections: [
      {
        title: 'Адрес и часы',
        fields: [
          { key: 'address_ru', label: 'Адрес', type: 'text' },
          { key: 'hours_ru', label: 'Часы работы', type: 'text' },
          { key: 'metro_ru', label: 'Метро', type: 'text' },
          { key: 'map_embed_url', label: 'Ссылка карты (Яндекс-виджет)', type: 'text', single: true, hint: 'По умолчанию — карта на Большую Дмитровку 1. Можно вставить свой Яндекс map-widget.' },
        ],
      },
      {
        title: 'Связь',
        fields: [
          { key: 'phone', label: 'Телефон', type: 'text', single: true },
          { key: 'email_rent', label: 'Email — залы и мероприятия', type: 'text', single: true },
          { key: 'email_press', label: 'Email — пресс-служба', type: 'text', single: true },
          { key: 'contact_email', label: 'Email — общий (резервный для подвала)', type: 'text', single: true },
        ],
      },
      {
        title: 'Отзывы (виджет Яндекс Карт)',
        fields: [
          { key: 'yandex_reviews_url', label: 'Ссылка на виджет отзывов', type: 'text', single: true, hint: 'Яндекс Бизнес → «Виджет отзывов» → ссылка вида https://yandex.ru/maps-reviews-widget/ORG_ID. Отзывы обновляются автоматически.' },
        ],
      },
    ],
  },
  {
    id: 'footer',
    label: 'Подвал',
    description: 'Юридическая информация в подвале.',
    group: 'Общее',
    icon: PanelBottom,
    href: '/',
    span: { col: 2, row: 1 },
    sections: [
      {
        title: 'Реквизиты',
        fields: [
          { key: 'legal_full_name', label: 'Полное название юр. лица', type: 'text', single: true },
          { key: 'legal_inn', label: 'ИНН', type: 'text', single: true },
          { key: 'legal_ogrn', label: 'ОГРН', type: 'text', single: true },
          { key: 'legal_kpp', label: 'КПП', type: 'text', single: true },
          { key: 'legal_address', label: 'Юридический адрес', type: 'text', single: true },
        ],
      },
      {
        title: 'Соцсети (ссылки; пустые скрываются)',
        fields: [
          { key: 'social_vk', label: 'ВКонтакте', type: 'text', single: true, hint: 'Полная ссылка https://vk.com/...' },
          { key: 'social_max', label: 'MAX', type: 'text', single: true, hint: 'Полная ссылка на профиль в мессенджере MAX.' },
          { key: 'social_tg', label: 'Telegram', type: 'text', single: true, hint: 'Полная ссылка https://t.me/...' },
        ],
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    description: 'Счётчики Яндекс.Метрики и Google Analytics.',
    group: 'Общее',
    icon: BarChart3,
    href: '/',
    sections: [
      {
        title: 'Счётчики (грузятся только если заполнены)',
        fields: [
          { key: 'analytics_yandex_metrika', label: 'Яндекс.Метрика — номер счётчика', type: 'text', single: true, hint: 'Только цифры, напр. 12345678.' },
          { key: 'analytics_ga_id', label: 'Google Analytics — Measurement ID', type: 'text', single: true, hint: 'Формат G-XXXXXXX.' },
        ],
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Политика конфиденциальности',
    description: 'Заголовок и полный текст.',
    group: 'Документы',
    icon: Shield,
    href: '/privacy-policy',
    sections: [
      {
        title: 'Документ',
        fields: [
          { key: 'privacy_title', label: 'Заголовок', type: 'text' },
          { key: 'privacy_body', label: 'Полный текст', type: 'textarea', rows: 16, hint: 'Параграфы разделяйте пустой строкой.' },
        ],
      },
    ],
  },
  {
    id: 'consent',
    label: 'Согласие на ПДн',
    description: 'Заголовок и полный текст.',
    group: 'Документы',
    icon: FileCheck,
    href: '/personal-data-consent',
    sections: [
      {
        title: 'Документ',
        fields: [
          { key: 'consent_title', label: 'Заголовок', type: 'text' },
          { key: 'consent_body', label: 'Полный текст', type: 'textarea', rows: 16, hint: 'Параграфы разделяйте пустой строкой.' },
        ],
      },
    ],
  },
];

const PAGE_GROUPS: Array<{ name: string; ids: string[] }> = [
  { name: 'Страницы', ids: PAGES.filter((p) => p.group === 'Страницы').map((p) => p.id) },
  { name: 'Общее', ids: PAGES.filter((p) => p.group === 'Общее').map((p) => p.id) },
  { name: 'Документы', ids: PAGES.filter((p) => p.group === 'Документы').map((p) => p.id) },
];

const ACCEPT_IMAGE = 'image/*';
const ACCEPT_VIDEO = 'video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.ogg,.mov,.m4v,.avi,.mkv';
const ACCEPT_PDF = 'application/pdf,.pdf';

/* ------------------------------------------------------------------ */

type SettingRow = { key: string; value_ru: string; value_en: string };

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  /** `null` — отображается bento-сетка страниц; иначе открыт редактор страницы. */
  const [activePage, setActivePage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    adminApi
      .getSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRow = (key: string): SettingRow =>
    settings.find((s) => s.key === key) ?? { key, value_ru: '', value_en: '' };

  const updateRow = (key: string, field: 'value_ru' | 'value_en', value: string) => {
    setSettings((prev) => {
      const exists = prev.find((s) => s.key === key);
      if (exists) return prev.map((s) => (s.key === key ? { ...s, [field]: value } : s));
      return [
        ...prev,
        {
          key,
          value_ru: field === 'value_ru' ? value : '',
          value_en: field === 'value_en' ? value : '',
        },
      ];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (key: string, file: File | undefined) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const url = await adminApi.uploadFile(file);
      updateRow(key, 'value_ru', url);
      updateRow(key, 'value_en', url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка загрузки файла');
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const page = useMemo(() => (activePage ? PAGES.find((p) => p.id === activePage) ?? null : null), [activePage]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 size={14} className="animate-spin" /> Загрузка…
      </div>
    );
  }

  /* --------------------------------------------------------------- */
  /* BENTO landing — список всех страниц сайта.                       */
  /* --------------------------------------------------------------- */
  if (!page) {
    return (
      <motion.div
        className="grid gap-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <header>
          <h1 className="font-heading text-[clamp(30px,4vw,44px)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
            Настройки
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Каждая карточка — отдельная страница сайта. Откройте, чтобы отредактировать тексты, фото и видео.
          </p>
        </header>

        {PAGE_GROUPS.map((group) => (
          <section key={group.name} className="grid gap-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{group.name}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.ids.map((id) => {
                const p = PAGES.find((x) => x.id === id);
                if (!p) return null;
                const Icon = p.icon;
                const fieldCount = p.sections.reduce((n, s) => n + s.fields.length, 0);
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePage(p.id)}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 text-left transition hover:border-ink hover:shadow-lg sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white transition group-hover:bg-accent sm:h-11 sm:w-11">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <span className="rounded-full bg-paper px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                        {fieldCount} {fieldCount === 1 ? 'поле' : fieldCount < 5 ? 'поля' : 'полей'}
                      </span>
                    </div>
                    <div>
                      <div className="font-heading text-lg font-bold uppercase leading-[1.05] tracking-[0.02em] text-ink sm:text-xl md:text-2xl">
                        {p.label}
                      </div>
                      <div className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-muted sm:text-xs">{p.description}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </motion.div>
    );
  }

  /* --------------------------------------------------------------- */
  /* Page editor — редактор выбранной страницы.                       */
  /* --------------------------------------------------------------- */
  const PageIcon = page.icon;
  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={page.id}
    >
      {/* Хлебная крошка + кнопки */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setActivePage(null)}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted transition hover:text-ink"
        >
          <ArrowLeft size={14} /> Все страницы
        </button>
        <div className="flex items-center gap-2">
          <a
            href={page.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:border-ink"
          >
            Открыть страницу ↗
          </a>
          <SaveButton saving={saving} saved={saved} onClick={handleSave} />
        </div>
      </div>

      {/* Заголовок страницы */}
      <header className="flex items-center gap-4 border-b border-line pb-5">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white md:h-14 md:w-14">
          <PageIcon size={22} strokeWidth={1.7} />
        </span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{page.group}</div>
          <h1 className="font-heading text-[clamp(28px,4vw,52px)] font-semibold uppercase leading-none tracking-[-0.03em]">
            {page.label}
          </h1>
        </div>
      </header>

      {/* Секции страницы */}
      <div className="grid gap-5">
        {page.sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="font-heading text-lg font-bold uppercase tracking-[0.04em] text-ink">
              {section.title}
            </h2>
            <div className="mt-5 grid gap-6">
              {section.fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  row={getRow(field.key)}
                  uploading={uploading[field.key]}
                  onChange={(f, v) => updateRow(field.key, f, v)}
                  onUpload={(file) => handleUpload(field.key, file)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Sticky save */}
      <div className="sticky bottom-4 flex justify-end">
        <SaveButton saving={saving} saved={saved} onClick={handleSave} shadow />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Один редактор поля. Универсальный для text/textarea/image/video.    */
/* ------------------------------------------------------------------ */
function FieldEditor({
  field,
  row,
  uploading,
  onChange,
  onUpload,
}: {
  field: Field;
  row: SettingRow;
  uploading?: boolean;
  onChange: (f: 'value_ru' | 'value_en', v: string) => void;
  onUpload: (file: File | undefined) => void;
}) {
  if (field.type === 'list' && field.itemFields) {
    return (
      <div className="grid gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
        <div className="text-sm font-semibold text-ink">
          {field.label}
          {field.hint ? <span className="ml-2 text-xs font-normal text-muted">{field.hint}</span> : null}
        </div>
        <ListEditor
          raw={row.value_ru}
          itemFields={field.itemFields}
          itemLabel={field.itemLabel ?? 'Добавить элемент'}
          onChange={(json) => onChange('value_ru', json)}
        />
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <div className="grid gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <FileText size={14} className="text-muted" />
          <span className="text-sm font-semibold text-ink">{field.label}</span>
          {field.hint ? <span className="w-full text-xs text-muted md:w-auto md:flex-1">{field.hint}</span> : null}
        </div>

        {row.value_ru ? (
          <a
            href={row.value_ru}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink transition hover:border-ink"
          >
            <FileText size={14} /> Открыть текущий PDF ↗
          </a>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-paper px-4 py-4 text-xs text-muted">
            PDF не загружен
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={row.value_ru}
            onChange={(e) => {
              onChange('value_ru', e.target.value);
              onChange('value_en', e.target.value);
            }}
            placeholder="URL PDF или загрузите файл"
            className="min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
          />
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink transition hover:border-ink">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Загрузка…' : 'Загрузить PDF'}
            <input
              type="file"
              accept={ACCEPT_PDF}
              onChange={(e) => onUpload(e.target.files?.[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  }

  if (field.type === 'image' || field.type === 'video') {
    return (
      <div className="grid gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
        <div className="flex flex-wrap items-center gap-2">
          {field.type === 'image' ? <ImageIcon size={14} className="text-muted" /> : <Video size={14} className="text-muted" />}
          <span className="text-sm font-semibold text-ink">{field.label}</span>
          {field.hint ? <span className="w-full text-xs text-muted md:w-auto md:flex-1">{field.hint}</span> : null}
        </div>

        <MediaPreview url={row.value_ru} type={field.type} />

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={row.value_ru}
            onChange={(e) => {
              onChange('value_ru', e.target.value);
              onChange('value_en', e.target.value);
            }}
            placeholder={field.type === 'image' ? 'URL изображения' : 'URL видео'}
            className="min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
          />
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink transition hover:border-ink">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Загрузка…' : 'Загрузить с ПК'}
            <input
              type="file"
              accept={field.type === 'image' ? ACCEPT_IMAGE : ACCEPT_VIDEO}
              onChange={(e) => onUpload(e.target.files?.[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  }

  const isTextarea = field.type === 'textarea';

  return (
    <div className="grid gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <div className="text-sm font-semibold text-ink">
        {field.label}
        {field.hint ? <span className="ml-2 text-xs font-normal text-muted">{field.hint}</span> : null}
      </div>

      {field.single ? (
        isTextarea ? (
          <textarea
            value={row.value_ru}
            onChange={(e) => {
              onChange('value_ru', e.target.value);
              onChange('value_en', e.target.value);
            }}
            rows={field.rows ?? 4}
            className="w-full rounded-xl border border-line bg-white p-3 outline-none transition focus:border-ink"
          />
        ) : (
          <input
            value={row.value_ru}
            onChange={(e) => {
              onChange('value_ru', e.target.value);
              onChange('value_en', e.target.value);
            }}
            className="min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
          />
        )
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <LangField
            lang="RU"
            value={row.value_ru}
            multiline={isTextarea}
            rows={field.rows}
            onChange={(v) => onChange('value_ru', v)}
          />
          <LangField
            lang="EN"
            value={row.value_en}
            multiline={isTextarea}
            rows={field.rows}
            onChange={(v) => onChange('value_en', v)}
          />
        </div>
      )}
    </div>
  );
}

function LangField({
  lang,
  value,
  multiline,
  rows,
  onChange,
}: {
  lang: 'RU' | 'EN';
  value: string;
  multiline?: boolean;
  rows?: number;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        <Globe2 size={11} /> {lang}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows ?? 4}
          className="w-full rounded-xl border border-line bg-white p-3 outline-none transition focus:border-ink"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none transition focus:border-ink"
        />
      )}
    </div>
  );
}

function MediaPreview({ url, type }: { url: string; type: 'image' | 'video' }) {
  if (!url) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line bg-paper text-xs text-muted">
        Нет файла
      </div>
    );
  }
  if (type === 'image') {
    return <img src={url} alt="preview" className="h-44 w-full rounded-2xl object-cover" />;
  }
  return (
    <video
      key={url}
      src={url}
      controls
      muted
      className="aspect-video w-full rounded-2xl bg-ink object-cover"
    />
  );
}

/* ------------------------------------------------------------------ */
/* ListEditor — редактор массива однотипных элементов.                 */
/* Хранится в виде JSON-строки в `value_ru`. Каждое подполе может быть */
/* двуязычным ({ru, en}) или одноязычным (просто строка).              */
/* ------------------------------------------------------------------ */
type ListItem = Record<string, string | { ru: string; en: string }>;

function parseListRaw(raw: string): ListItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ListEditor({
  raw,
  itemFields,
  itemLabel,
  onChange,
}: {
  raw: string;
  itemFields: ListSubField[];
  itemLabel: string;
  onChange: (json: string) => void;
}) {
  const items = parseListRaw(raw);

  const commit = (next: ListItem[]) => {
    onChange(next.length === 0 ? '' : JSON.stringify(next));
  };

  const updateItem = (idx: number, patch: Partial<ListItem>) => {
    // Partial<ListItem> расширяет values до `... | undefined`, TS отвергает
    // присвоение обратно в ListItem[]. Приводим явно — реально undefined
    // в patch попасть не должен, спред оставит исходное значение.
    const next = items.map((it, i) =>
      i === idx ? { ...it, ...patch } : it,
    ) as ListItem[];
    commit(next);
  };

  const addItem = () => {
    const empty: ListItem = {};
    itemFields.forEach((sf) => {
      empty[sf.key] = sf.bilingual === false ? '' : { ru: '', en: '' };
    });
    commit([...items, empty]);
  };

  const removeItem = (idx: number) => {
    commit(items.filter((_, i) => i !== idx));
  };

  const moveItem = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  };

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper px-4 py-6 text-center text-xs text-muted">
          Список пуст. Добавьте первый элемент.
        </div>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-line bg-paper-soft p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Элемент {idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:border-ink disabled:opacity-30"
                  aria-label="Вверх"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:border-ink disabled:opacity-30"
                  aria-label="Вниз"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:border-error hover:text-error"
                  aria-label="Удалить"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="grid gap-3">
              {itemFields.map((sf) => {
                const value = item[sf.key];
                if (sf.type === 'icon') {
                  const name = typeof value === 'string' ? value : '';
                  return (
                    <IconPickerField
                      key={sf.key}
                      label={sf.label}
                      value={name}
                      onChange={(v) => updateItem(idx, { [sf.key]: v })}
                    />
                  );
                }
                if (sf.type === 'image') {
                  const url = typeof value === 'string' ? value : '';
                  return (
                    <ListImageField
                      key={sf.key}
                      label={sf.label}
                      value={url}
                      onChange={(v) => updateItem(idx, { [sf.key]: v })}
                    />
                  );
                }
                const isBi = sf.bilingual !== false;
                if (!isBi) {
                  const raw = typeof value === 'string' ? value : '';
                  return (
                    <div key={sf.key} className="grid gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{sf.label}</span>
                      <input
                        type="text"
                        value={raw}
                        onChange={(e) => updateItem(idx, { [sf.key]: e.target.value })}
                        className="min-h-10 w-full rounded-lg border border-line bg-white px-3 outline-none transition focus:border-ink"
                      />
                    </div>
                  );
                }
                const bi = typeof value === 'object' && value ? value : { ru: '', en: '' };
                const onChangeLang = (lng: 'ru' | 'en', v: string) =>
                  updateItem(idx, { [sf.key]: { ...bi, [lng]: v } });
                return (
                  <div key={sf.key} className="grid gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{sf.label}</span>
                    <div className="grid gap-2 md:grid-cols-2">
                      {(['ru', 'en'] as const).map((lng) => (
                        <div key={lng} className="grid gap-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
                            <Globe2 size={10} /> {lng.toUpperCase()}
                          </span>
                          {sf.multiline ? (
                            <textarea
                              value={bi[lng] ?? ''}
                              onChange={(e) => onChangeLang(lng, e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-line bg-white p-2 outline-none transition focus:border-ink"
                            />
                          ) : (
                            <input
                              type="text"
                              value={bi[lng] ?? ''}
                              onChange={(e) => onChangeLang(lng, e.target.value)}
                              className="min-h-10 w-full rounded-lg border border-line bg-white px-3 outline-none transition focus:border-ink"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-dashed border-line bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition hover:border-ink"
      >
        <Plus size={14} /> {itemLabel}
      </button>
    </div>
  );
}

function ListImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await adminApi.uploadFile(file);
      onChange(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      {value ? (
        <img src={value} alt="" className="h-28 w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-line bg-white text-xs text-muted">
          Нет изображения
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL изображения"
          className="min-h-10 w-full rounded-lg border border-line bg-white px-3 outline-none transition focus:border-ink"
        />
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-ink transition hover:border-ink">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {busy ? '…' : 'Загрузить'}
          <input type="file" accept={ACCEPT_IMAGE} onChange={(e) => upload(e.target.files?.[0])} className="hidden" />
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* IconPickerField — выбор иконки Lucide из реестра.                    */
/* Значение хранится строкой-именем (напр. "Ban"). Используется и на    */
/* сайте (страница «Зрителям») через getLucideIcon.                     */
/* ------------------------------------------------------------------ */
function IconPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const Current = getLucideIcon(value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_NAMES;
    return ICON_NAMES.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="grid gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-10 items-center gap-3 self-start rounded-lg border border-line bg-white px-3 text-sm text-ink transition hover:border-ink"
      >
        <span className="grid h-7 w-7 place-items-center rounded-md bg-paper text-ink">
          <Current size={16} strokeWidth={1.7} />
        </span>
        <span className="font-medium">{value || 'Выбрать иконку'}</span>
      </button>

      {open ? (
        <div className="grid gap-2 rounded-xl border border-line bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-paper px-2.5">
              <Search size={14} className="text-muted" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск иконки…"
                className="min-h-9 w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition hover:border-ink hover:text-ink"
              aria-label="Закрыть"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
            {filtered.map((name) => {
              const Icon = getLucideIcon(name);
              const active = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={[
                    'grid aspect-square place-items-center rounded-lg border transition',
                    active ? 'border-accent bg-accent text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-accent/40',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={1.7} />
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-muted">Ничего не найдено</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SaveButton({
  saving,
  saved,
  onClick,
  shadow,
}: {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
  shadow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className={[
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-accent bg-accent px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition disabled:opacity-60',
        shadow ? 'shadow-xl' : '',
      ].join(' ')}
    >
      {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
      {saving ? 'Сохранение…' : saved ? 'Сохранено' : 'Сохранить изменения'}
    </button>
  );
}
