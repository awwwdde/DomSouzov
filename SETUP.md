# Дом Союзов — Гайд по настройке и запуску

## Рекомендуемый запуск из корня (Windows / PowerShell)

```bash
cd DomSouzov
npm run setup   # единоразовая настройка
npm run dev     # поднимает backend + frontend одновременно
```

После запуска:
- Frontend: `http://localhost:5173`
- API: `http://localhost:8000/api`
- Админка: `http://localhost:5173/admin/login`

## Что делают команды из корня

- `npm run setup`:
  - создаёт `backend/venv` (если его нет),
  - устанавливает backend/frontend/root зависимости,
  - создаёт `backend/.env` из примера,
  - выполняет `seed.py` (создаёт таблицы, контент и пользователей).
- `npm run dev`:
  - автоматически освобождает порты `8000` и `5173` (если заняты),
  - запускает backend и frontend в одном терминале.

## Быстрый старт (Docker)

```bash
# 1. Скопируйте и настройте .env
Copy-Item backend/.env.example backend/.env
# Отредактируйте SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD

# 2. Запустите всё одной командой
docker-compose up --build

# Сайт: http://localhost:3000
# Админ: http://localhost:3000/admin
# API:   http://localhost:8000/api
```

## Разработка (без Docker)

### Backend

```bash
cd backend
python -m venv venv
# PowerShell (Windows):
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Copy-Item .env.example .env
# По умолчанию используется SQLite (работает "из коробки")
# Для PostgreSQL замените DATABASE_URL в .env

python seed.py        # Создаёт таблицы и начальные данные
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Вход в админку

URL: `http://localhost:5173/admin/login`

После `npm run setup` доступны 2 учётки:

- Основной администратор:
  - email: `admin@dom-soyuzov.ru`
  - password: `changeme`
- Тестовый супер-пользователь:
  - email: `superadmin@test.local`
  - password: `superadmin123`

Важно: для production обязательно поменяйте оба пароля и `SECRET_KEY` в `backend/.env`.

## Структура проекта

```
/
├── backend/            # FastAPI + SQLAlchemy
│   ├── main.py         # Точка входа
│   ├── models.py       # Модели БД
│   ├── schemas.py      # Pydantic-схемы
│   ├── auth.py         # JWT аутентификация
│   ├── seed.py         # Начальные данные
│   └── routers/
│       ├── public.py   # GET /api/...
│       └── admin.py    # /api/admin/...
│
├── frontend/           # React + Vite + TypeScript
│   └── src/
│       ├── pages/      # Публичные страницы + /admin
│       ├── components/ # Header, Footer, HeroA, EventsC...
│       ├── context/    # SiteContext (язык, контент)
│       ├── api/        # Axios-клиент
│       └── types/      # TypeScript-типы
│
└── docker-compose.yml
```

## Страницы сайта

| URL | Страница |
|-----|----------|
| `/` | Главная (Hero A + Events C) |
| `/events` | Афиша |
| `/events/:id` | Карточка мероприятия |
| `/about` | О Доме |
| `/halls` | Залы |
| `/gallery` | Галерея |
| `/organizers` | Организаторам |
| `/audience` | Зрителям |
| `/contacts` | Контакты |
| `/news` | Хроники |
| `/news/:id` | Статья |
| `/admin` | Админ-панель |
| `/admin/login` | Вход в CMS |

## Admin API

```
POST /api/admin/login        { email, password } → { access_token }
GET  /api/admin/me
POST /api/admin/upload       multipart/form-data → { url }

GET/POST        /api/admin/events
PUT/DELETE      /api/admin/events/:id

GET/POST        /api/admin/news
PUT/DELETE      /api/admin/news/:id

GET/POST        /api/admin/halls
PUT/DELETE      /api/admin/halls/:id

GET/POST        /api/admin/gallery
PUT/DELETE      /api/admin/gallery/:id

GET             /api/admin/settings
PUT             /api/admin/settings   { settings: [{key, value_ru, value_en}] }
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| `DATABASE_URL` | URL базы данных | `sqlite:///./domsoyuzov.db` |
| `SECRET_KEY` | JWT секрет (32+ символа) | `dev-secret...` |
| `ADMIN_EMAIL` | Email администратора | `admin@dom-soyuzov.ru` |
| `ADMIN_PASSWORD` | Пароль администратора | `changeme` |
| `TEST_SUPERUSER_EMAIL` | Email тестового супер-пользователя | `superadmin@test.local` |
| `TEST_SUPERUSER_PASSWORD` | Пароль тестового супер-пользователя | `superadmin123` |
| `CORS_ORIGINS` | Разрешённые CORS-домены | `http://localhost:5173` |
