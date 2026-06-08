# Дом Союзов — лог прогресса

Хронологический журнал по шагам. Самое свежее — снизу.
Структурный снимок «сделано / осталось» — в `STATUS.md`. Решения — в `memory/domsouzov-decisions.md`.
Коммитит изменения сам пользователь (я не коммичу).

---

## Сессия 1 (2026-06-05) — Фаза 1

- Введён зелёный акцент #1F5F4E (`index.css`).
- Исправлен баг навигации (Lenis сброс скролла в 3 точках + `overflow-anchor:none`).
- Адаптивное мобильное меню (`Header.tsx`).
- Почищен футер: соцсети из CMS, честные ссылки (`Footer.tsx`).
- Партнёры крупнее, без grayscale (`PartnersSection.tsx`).
- Переписаны «Организаторам» (2 PDF-кнопки) и «Зрителям» (карточки правил).
- Бэкенд: загрузка PDF в `/api/admin/upload`; `.env.example` под Postgres; `migrate_to_postgres.py`.
- Созданы STATUS.md, memory/.

---

## Сессия 2 (2026-06-08) — старт

- Сверил реальное состояние с STATUS.md: файлы (`migrate_to_postgres.py`, `.env.example`, правки фронта) на месте, изменения прошлой сессии закоммичены пользователем.
- Создан этот файл `PROGRESS-LOG.md` для пошагового журнала.
- **SEO бэкенд готов** (выбран подход: серверная инъекция мета в FastAPI, т.к. прод = единый контейнер FastAPI+SPA; vite-пререндер не нужен):
  - `backend/seo.py` — генерация `<head>` (title/description/canonical/og/twitter/JSON-LD) по маршруту: статические страницы, `/events/{id}` (JSON-LD Event), `/news/{id}` (JSON-LD NewsArticle), `/gallery/{slug}`; + `build_sitemap` (из БД) и `build_robots`.
  - `config.py`: добавлен `SITE_URL` (https://union.awwwdde.art).
  - `main.py`: эндпоинты `/robots.txt`, `/sitemap.xml`; `spa_fallback` теперь внедряет мета в index.html (только прод, где есть STATIC_DIR; при ошибке — фолбэк на обычный index.html).
  - Проверено: импорт OK; robots/sitemap/head генерируются корректно (события и новости попадают в sitemap, Event JSON-LD заполнен из БД).
- **Клиентский SEO готов**:
  - Установлен `react-helmet-async@2`; `main.tsx` обёрнут в `HelmetProvider`.
  - Создан компонент `frontend/src/components/Seo.tsx` (title/description/canonical/og/twitter + JSON-LD + noindex).
  - `<Seo>` добавлен на все публичные страницы: Home (JSON-LD Organization), Events, EventDetail (JSON-LD Event), News, NewsDetail (JSON-LD NewsArticle), About, Halls, Organizers, Audience, Contacts, Gallery, GalleryCategory; правовые (Privacy/Consent/Terms) — с `noindex`.
  - `index.html`: дефолтные title/description/og/theme-color (#1f5f4e).
  - `inject_head` вычищает дефолтные мета из index.html → в серверном ответе ровно один набор.
- **Проверено end-to-end**: `npm run build` OK; бэкенд со `STATIC_DIR=dist` отдаёт правильные `<title>`/og/JSON-LD для `/`, `/events/1` (Event), `/news/1`; `/robots.txt` и `/sitemap.xml` (с событиями/новостями) работают; дублей мета нет (og:title=1, description=1).
- Осталось по SEO: положить `frontend/public/og-default.jpg` (дефолтная OG-картинка) и `favicon.svg`; Яндекс.Метрика/GA; submit sitemap в вебмастеры (на проде).
- **Админка + доп.правки**:
  - `AdminSettings.tsx`: добавлен тип поля `file` (загрузка PDF + ссылка-превью); раздел «Организаторам» переведён на новую страницу (поле `organizers_note` + два PDF: `organizers_rider_pdf`, `organizers_halls_pdf`); «Зрителям» — карточки правил (`audience_items`: title/desc), FAQ убран; в «Подвал» добавлены соцсети (`social_vk/tg/yt`).
  - Страница **404** (`pages/NotFound.tsx`) + маршрут `path="*"`; на бэке неизвестные маршруты получают `noindex`.
  - favicon переключён на существующий `/logo-house.svg`.
  - Проверено: `npm run build` OK, tsc чисто; сервер отдаёт корректные title для /organizers, /audience; junk-маршруты → noindex «Страница не найдена».
- **Осталось** (см. STATUS.md): `frontend/public/og-default.jpg`; Яндекс.Метрика/GA; форма подписки (wire/убрать); реальный переход на Postgres (нужны креды); код-сплит бандла (575KB); загрузить реальные PDF/соцсети/тексты в CMS на проде.
- Следующий шаг (на выбор пользователя): аналитика-счётчики через CMS, либо подписка, либо помощь с деплоем Postgres.
