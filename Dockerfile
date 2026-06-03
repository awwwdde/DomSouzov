# ============================================================================
# Дом Союзов — один контейнер, готовый под awwwdde-panel.
#
# Контракт гостя:
#   • Dockerfile в корне репозитория (этот файл)
#   • Приложение слушает порт 8080
#   • GET /healthz отдаёт 200, когда готово
#   • БД берётся из переменной окружения DATABASE_URL
#   • Миграции/сид запускаются на старте контейнера
#
# Архитектура: фронт (React/Vite) собирается статикой и раздаётся тем же
# FastAPI-бэкендом, который обслуживает /api/* и /uploads/*. Один процесс,
# один порт — никаких nginx и docker-compose поверх.
# ============================================================================

# ── Stage 1: сборка фронта ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend

WORKDIR /app

# Сначала только манифесты — лучший слой-кэш.
COPY frontend/package.json frontend/package-lock.json* ./

# npm install (не ci): lockfile в репо может слегка разъехаться с package.json
# после правок (например, мы убираем self-reference dom-soyuzov-root).
RUN npm install --no-audit --no-fund

COPY frontend/ ./

RUN npm run build


# ── Stage 2: рантайм ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# libpq-dev/gcc — для psycopg2-binary колесо обычно есть, но GCC оставляем
# на случай sdist; curl — для отладочных healthcheck-пингов изнутри.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Бэкенд-код (без локальной SQLite и кэшей — отсекает .dockerignore).
COPY backend/ ./

# Собранная SPA из stage 1 — её раздаёт сам FastAPI.
COPY --from=frontend /app/dist /app/static

# Папка под загрузки админки. На awwwdde-volume не монтируется, значит
# изображения переживают только до следующего redeploy. TODO: добавить
# поддержку per-project volume в panel, если станет важно.
RUN mkdir -p /app/uploads

ENV STATIC_DIR=/app/static \
    PYTHONUNBUFFERED=1

EXPOSE 8080

# Сид/миграции на старте, потом uvicorn. seed.py создаёт таблицы (Base.metadata)
# и идемпотентно докидывает дефолтных админов/настройки.
CMD ["sh", "-c", "python seed.py && uvicorn main:app --host 0.0.0.0 --port 8080"]
