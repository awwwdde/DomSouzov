import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Ensure imports always resolve to this local backend folder first.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from config import settings
from database import engine, Base
from migrate_db import migrate_sqlite
from routers import public, admin

Base.metadata.create_all(bind=engine)
migrate_sqlite()

app = FastAPI(title="Дом Союзов CMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(public.router)
app.include_router(admin.router)


# Healthcheck для awwwdde-panel: контейнер считается готовым, как только
# отсюда прилетает 200 (см. back/engine.py:wait_healthy в panel-репо).
@app.get("/healthz")
def healthz():
    return {"status": "ok", "service": "dom-soyuzov-cms"}


# Бэкомпат для старого пути.
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "dom-soyuzov-cms"}


# ── SPA: раздаём собранный фронт тем же процессом ────────────────────────────
# Каталог задаётся переменной STATIC_DIR (см. Dockerfile в корне репо).
# Если статика не подмонтирована — гасим SPA-раздачу: удобно для dev-режима,
# где фронт крутится отдельно на Vite (порт 5173).
STATIC_DIR = os.environ.get("STATIC_DIR", "")
if STATIC_DIR and os.path.isdir(STATIC_DIR):
    _ASSETS = os.path.join(STATIC_DIR, "assets")
    if os.path.isdir(_ASSETS):
        app.mount("/assets", StaticFiles(directory=_ASSETS), name="assets")

    _INDEX = os.path.join(STATIC_DIR, "index.html")

    # Catch-all регистрируем ПОСЛЕДНИМ, чтобы /api/*, /uploads/*, /healthz
    # успели сматчиться выше. Файлы из корня сборки (favicon, manifest) —
    # отдаём как есть, всё остальное — index.html для React Router.
    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        candidate = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(_INDEX)
