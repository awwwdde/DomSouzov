# Дом Союзов — обзор проекта

**Обновлено:** май 2026.

Документ описывает технический стек, функциональность публичной части и админки, анимации, npm/PowerShell-скрипты и принципы дизайна репозитория **DomSouzov** (официальный сайт культурного учреждения «Дом Союзов»). Детальный поэтапный план анимаций и UX см. в `CURSOR-IMPLEMENTATION-PLAN.md`.

---

## 1. Архитектура и стек

Проект — **монорепозиторий**: SPA на React общается с REST API на Python; в разработке фронтенд проксирует `/api` и `/uploads` на локальный бэкенд (см. `frontend/vite.config.ts`).

### Frontend

| Технология | Назначение |
|------------|------------|
| **React 18** | UI и маршрутизация страниц |
| **TypeScript** | типизация компонентов и API |
| **Vite 5** | сборка, dev-сервер (порт **5173**) |
| **React Router v6** | публичные маршруты и вложенная админка (`/admin/*`); корневой `Routes` в `App.tsx` разделяет админку и `PublicLayout` |
| **Tailwind CSS v4** | утилитарные стили, кастомная тема в `frontend/src/index.css` (`@import "tailwindcss"`, блок `@theme`) |
| **PostCSS + Autoprefixer** | обработка CSS |
| **Axios** | HTTP-клиент, базовый URL `/api`, интерцептор JWT для админки |
| **Framer Motion ~12.38** | анимации появления, прелоадер, календарь, `Reveal`, бегущая строка, админ-оболочка |
| **lucide-react** | иконки (меню, глаз «версия для слабовидящих», стрелки календаря, навигация CMS) |

Зависимость `dom-soyuzov-root` в `frontend/package.json` указывает на корень репозитория (`file:..`) — используется для связки workspace с корневым `package.json` и скриптами `concurrently`.

### Backend

| Технология | Назначение |
|------------|------------|
| **FastAPI** | приложение `backend/main.py`, CORS, раздача статики загрузок |
| **Uvicorn** | ASGI-сервер (в dev — порт **8001**) |
| **SQLAlchemy 2** | ORM, модели в `backend/models.py` |
| **Alembic** | миграции (в зависимостях; схема создаётся также через `Base.metadata.create_all`) |
| **SQLite или PostgreSQL** | через `DATABASE_URL` в `.env` (пример в `backend/.env.example`) |
| **python-jose, passlib/bcrypt** | JWT и хеширование паролей администратора |
| **Pillow, aiofiles, python-multipart** | изображения и загрузка файлов |
| **Pydantic / pydantic-settings** | конфигурация и схемы |

Роутеры: `backend/routers/public.py` (публичный контент), `backend/routers/admin.py` (CRUD и загрузки). Статика: монтирование каталога `uploads`. Health: `GET /api/health`.

### Контейнеризация

В `backend/Dockerfile` — образ на Python 3.12-slim с установкой зависимостей и запуском `seed.py` + `uvicorn` на порту 8000 (для деплоя отдельно от корневых npm-скриптов).

---

## 2. Функции приложения

### Точка входа фронтенда (`frontend/src/App.tsx`)

- **`BrowserRouter`** → **`SiteProvider`** (контекст сайта, загрузка `GET /api/content`) → **`AppShell`**.
- **`AppShell`**: состояние `bootDone`; пока `false`, поверх всего рендерится **`Preloader`** (см. ниже); параллельно монтируются **`Routes`** (админка и публичная ветка не блокируются загрузкой контента).
- **`PublicLayout`**: `Header` + `main` с вложенным **`Routes`** (индекс и пути `events`, `about`, …); при смене `location.pathname` вызывается **`window.scrollTo(0, 0)`**.

### Прелоадер (`frontend/src/components/Preloader.tsx`)

- Полноэкранный оверлей через **`createPortal(..., document.body)`** и высокий `z-index`, чтобы перекрывать шапку и fixed-элементы.
- Анимация букв «ДОМ СОЮЗОВ», линия `scaleX`, выезд вверх; по завершении вызывается `onComplete` → `bootDone = true`.
- **Один показ за сессию вкладки:** флаг в **`sessionStorage`**, ключ **`ds_preloader_shown`**. Обычный **Ctrl+F5** флаг не сбрасывает — для повторного просмотра нужно очистить session storage или открыть новую вкладку.
- Мгновенный пропуск (без анимации): **`isReducedMotionEnvironment()`** из `lib/motion.ts` — синхронно учитывает `prefers-reduced-motion: reduce` и включённую версию для слабовидящих в **`localStorage`** (`domsouzov-vision-settings`), до того как `Header` выставит `data-vision` на `<html>`.

### Публичный сайт

- **Главная** (`Home.tsx`) — **инлайн-герой** (секция ~`88vh`): видео из `t('hero_video_url')`, постер, `preload="metadata"`, параллакс и лёгкий zoom при скролле через Framer Motion; заголовок может подставляться из **`t('hero_manifesto')`** (многострочный текст из CMS, разбивка по `\n`), иначе — встроенные строки RU/EN; блоки «Спланировать визит», сетка событий, **`UpcomingEventsCalendar`**, CTA, новости; примитивы из **`Reveal.tsx`** (`Reveal`, `RevealSection`, `RevealList`, `RevealItem`, `RevealText`, `RevealMask`, `Parallax`, `HighlightOnView`).
- Компонент **`HeroA.tsx`** в репозитории есть, **на главную не подключается** (герой только в `Home`).
- **Афиша** — список мероприятий, карточки событий.
- **Карточка события** — детальная страница по `id`.
- **О Доме**, **Залы**, **Галерея**, **Организаторам**, **Зрителям**, **Контакты** — информационные разделы.
- **Новости** — лента и страница новости по `id`.

Данные для публичной части подгружаются пакетом **`GET /api/content`** (см. `SiteContext`: настройки, события, новости, залы, галерея). Функция **`t(key)`** возвращает строку настроек для текущего языка (`ru` / `en`) с fallback на русский.

### Язык и доступность

- Переключатель **RU / EN** в шапке.
- **Версия для слабовидящих**: режим пишет `data-vision`, `data-vision-font`, `data-vision-theme` на `<html>` и дублирует настройки в **`localStorage`** (`domsouzov-vision-settings`). В **`index.css`** при `html[data-vision="true"]` отключаются глобально CSS-`transition`/`animation` и тени; **JS-анимации Framer Motion** дополнительно отключаются через **`useReducedMotionActive()`** (OS + vision) в компонентах, где это предусмотрено.
- В **`Header.tsx`**: пилюля **«Открыто до …» / «Закрыто»** (RU/EN) по расписанию; часы из настроек **`hours_ru` / `hours_en`** при успешном парсинге, иначе встроенный fallback с пометкой TODO о выносе в CMS.

### Админ-панель (CMS)

Маршруты под `/admin` (без публичного Header/Footer):

- **Вход** — `/admin/login`, JWT в `localStorage` (`admin_token`).
- **Дашборд**, **Мероприятия**, **Хроники (новости)**, **Залы**, **Галерея**, **Настройки** — CRUD через `adminApi` в `frontend/src/api/client.ts`.
- Загрузка файлов — `POST /api/admin/upload`, URL картинок в сущностях.
- Смена пароля администратора — отдельный endpoint в клиенте.

Сущности в БД (обзор): админ-пользователь, пары ключ–значение настроек (`value_ru` / `value_en`), события, новости, залы, элементы галереи (детали полей — в `backend/models.py`).

### Сиды и демо-данные

`npm run seed` (корень) запускает `backend/seed.py` для первичного наполнения БД.

---

## 3. Анимации и motion-слой

Используется **Framer Motion** (версия в `package.json`, сейчас **^12.38**).

### Общий модуль `frontend/src/lib/motion.ts`

- Константы **`EASE_DS`**, **`DURATION`**, **`STAGGER`**, **`transitionBase`** — единые тайминги и easing.
- **`usePrefersReducedMotion()`**, **`useVisionMode()`** (подписка на `data-vision` через `MutationObserver`), **`useReducedMotionActive()`** — объединение «уменьшить движение» и версии для слабовидящих.
- **`isReducedMotionEnvironment()`** — синхронная проверка для прелоадера (OS + `localStorage` vision).
- Фабрики вариантов: **`fadeUp`**, **`fadeIn`**, **`maskUp`**, **`staggerParent`** (для `reduced` — без сдвигов / мгновенно).

### Компоненты

| Место | Поведение |
|-------|-----------|
| **`Reveal.tsx`** | Базовые: **`Reveal`**, **`RevealSection`**, **`RevealList`**, **`RevealItem`** — fade + Y, stagger; дополнительно **`RevealText`** (строки со stagger), **`RevealMask`** (clip-path), **`Parallax`** (scroll + `useTransform`; отключается при reduced), **`HighlightOnView`** (акцентные сегменты текста, цвет `accent`) |
| **`Preloader.tsx`** | Портал на `document.body`, буквы + линия + выезд; интеграция с `motion.ts` и reduced |
| **`Marquee.tsx`** | Бесконечный `x`; ускорение при скролле (стейт), замедление при hover; при **`useReducedMotionActive()`** — статичная полоса без бесконечной анимации |
| **`UpcomingEventsCalendar.tsx`** | Переходы из `motion.ts`; сетка дней с **`layout` / `layoutId`**, кольцо выбранной даты **`layoutId="day-ring"`** (spring); карточки событий с **`layoutId`** по `event.id`; при reduced — без layout-переездов / нулевая длительность |
| **`Header.tsx`** | Пилюля статуса — **`fadeIn`** + `motion.span` |
| **`AdminLayout.tsx`** | Въезд сайдбара слева (`x`, `opacity`), появление основной области (`opacity`, `y`) |
| **`AdminCrudPage.tsx`**, **`AdminDashboard.tsx`**, **`AdminSettings.tsx`** | Оформительные motion-обёртки для контента форм и дашборда |

Правило проекта: по возможности анимировать только **`transform`**, **`opacity`**, **`clip-path`** (см. `CURSOR-IMPLEMENTATION-PLAN.md`).

### Без Framer Motion

- **`Ticker.tsx`** — статичная полоса с текстовыми блоками (без keyframe-анимации в коде).
- **`HeroA.tsx`** — фоновое видео (автовоспроизведение, loop), градиент поверх; на главной не используется.

---

## 4. Скрипты

### Корень репозитория (`package.json`)

| Скрипт | Описание |
|--------|----------|
| **`npm run setup`** | PowerShell: `scripts/setup.ps1` — создание `backend/venv`, `pip install -r backend/requirements.txt`, копирование `.env` из примера при отсутствии, `seed.py`, `npm --prefix frontend install`, корневой `npm install` |
| **`npm run predev`** | Автоматически перед `dev`: `scripts/free-ports.ps1` — освобождение портов **8001** и **5173** (Windows, `netstat` + `taskkill`) |
| **`npm run dev`** | **Concurrently**: бэкенд `uvicorn backend.main:app --reload --port 8001` и фронт `npm --prefix frontend run dev` |
| **`npm run dev:backend`** | Только API на 8001 |
| **`npm run dev:frontend`** | Только Vite |
| **`npm run seed`** | Повторный запуск сида через venv Python |

Зависимость корня: **concurrently** для параллельного запуска процессов.

### Frontend (`frontend/package.json`)

| Скрипт | Описание |
|--------|----------|
| **`npm run dev`** | `vite` (dev-сервер с прокси) |
| **`npm run build`** | `tsc && vite build` — проверка типов и production-сборка |
| **`npm run preview`** | Локальный просмотр собранного бандла |

### PowerShell (`scripts/`)

- **`setup.ps1`** — полная первичная настройка окружения под Windows.
- **`free-ports.ps1`** — снижение конфликтов «address already in use» при перезапуске dev.

---

## 5. Дизайн и визуальный язык

### Типографика

- **Основной текст:** [Manrope](https://fonts.google.com/specimen/Manrope) (Google Fonts, веса 300–800).
- **Заголовки / акцентный гротеск:** [Roboto Condensed](https://fonts.google.com/specimen/Roboto+Condensed) — переменная темы `--font-heading`.

Подключение шрифтов — в `frontend/index.html`.

### Цветовая палитра (`@theme` в `index.css`)

| Токен | Роль |
|-------|------|
| `paper` / `paper-soft` | фон «бумаги», карточки |
| `ink` / `ink-soft` | основной и вторичный текст |
| `muted` | подписи, второстепенные элементы |
| `line` | границы, разделители |
| `accent` | золотистый акцент (#c8a35a), кольца фокуса, градиентные блики на body |

Фон **body**: комбинация лёгкого радиального «блика» в тон accent и вертикального градиента от `paper` к белому — ощущение премиальной полиграфии / культурного учреждения.

### Композиция и UI-паттерны

- Крупная типографика на главной (герой, навигация), **uppercase** и **letter-spacing** для меток.
- Скругления (**rounded-full** для кнопок, крупные радиусы для медиа-блоков).
- Шапка на главной — **фиксированная** поверх героя; на внутренних страницах — **sticky**, контраст светлого/тёмного текста от пути.
- Админка: тёмный сайдбар (**neutral-950**), светлая рабочая область (**paper**), крупный брендинг «ДОМ СОЮЗОВ / CMS».

### UX

- Плавный скролл: `scroll-behavior: smooth` на `html`.
- Иконки Lucide для узнаваемых действий (меню, доступность, навигация CMS).
- **`ActionButton`** и ссылки оформлены в едином минималистичном стиле границ и uppercase-подписей.

---

## 6. Структура каталогов (кратко)

```
DomSouzov/
├── backend/          # FastAPI, модели, роутеры, seed, Dockerfile
├── frontend/         # React + Vite + Tailwind
│   └── src/
│       ├── api/      # Axios-клиент
│       ├── lib/      # motion.ts — easing, хуки reduced/vision, фабрики вариантов
│       ├── components/
│       │   ├── Preloader.tsx
│       │   ├── Reveal.tsx
│       │   ├── UpcomingEventsCalendar.tsx
│       │   ├── Marquee.tsx
│       │   ├── Header.tsx, Footer.tsx, …
│       │   └── admin/
│       ├── context/  # SiteProvider, i18n-строки из CMS
│       ├── pages/    # публичные страницы + admin/
│       └── types/
├── scripts/          # setup.ps1, free-ports.ps1
├── CURSOR-IMPLEMENTATION-PLAN.md  # план анимаций/UX (этапы, приёмка)
└── package.json      # оркестрация dev и setup
```

---

## 7. Быстрый старт (напоминание)

1. Из корня: `npm run setup` (Windows, PowerShell).
2. `npm run dev` — бэкенд на **8001**, фронт на **5173**.
3. Убедиться, что `backend/.env` задаёт `DATABASE_URL` и учётные данные администратора.

Подробности конфигурации — в `backend/.env.example` и комментариях в коде роутеров.
