# Дом Союзов — Запуск проекта

## Быстрый старт (Docker)

```bash
# 1. Скопируйте и настройте .env
cp backend/.env.example backend/.env
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
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Настройте DATABASE_URL для вашего PostgreSQL

python seed.py        # Создаёт таблицы и начальные данные
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

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
| `DATABASE_URL` | PostgreSQL URL | `postgresql://domuser:dompass@localhost:5432/domsoyuzov` |
| `SECRET_KEY` | JWT секрет (32+ символа) | `dev-secret...` |
| `ADMIN_EMAIL` | Email администратора | `admin@dom-soyuzov.ru` |
| `ADMIN_PASSWORD` | Пароль администратора | `changeme` |
| `CORS_ORIGINS` | Разрешённые CORS-домены | `http://localhost:5173` |
