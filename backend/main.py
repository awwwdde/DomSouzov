import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, PlainTextResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

# Ensure imports always resolve to this local backend folder first.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from config import settings
from database import engine, Base, SessionLocal
from migrate_db import migrate_sqlite
from models import MediaFile
from routers import public, admin
import seo

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


# Security-заголовки. В прод-сборке (один контейнер) FastAPI раздаёт SPA сам,
# nginx.conf не задействован — поэтому заголовки ставим здесь.
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
    # HSTS действует только поверх HTTPS; по HTTP браузер заголовок игнорирует,
    # поэтому слать его безопасно всегда.
    response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response

# Загрузки раздаём из БД (переживают редеплой), с фолбэком на диск (локалка).
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@app.get("/uploads/{filename}", include_in_schema=False)
def serve_upload(filename: str):
    db = SessionLocal()
    try:
        m = db.query(MediaFile).filter(MediaFile.filename == filename).first()
        if m is not None:
            return Response(
                content=m.data,
                media_type=m.content_type or "application/octet-stream",
                headers={"Cache-Control": "public, max-age=31536000, immutable"},
            )
    finally:
        db.close()
    # Фолбэк: файл на диске (локальная разработка или legacy).
    path = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.isfile(path):
        return FileResponse(path)
    raise HTTPException(404, "File not found")

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


# ── SEO: robots.txt и sitemap.xml (динамически из БД) ────────────────────────
@app.get("/robots.txt", include_in_schema=False)
def robots_txt():
    return PlainTextResponse(seo.build_robots())


@app.get("/sitemap.xml", include_in_schema=False)
def sitemap_xml():
    db = SessionLocal()
    try:
        xml = seo.build_sitemap(db)
    finally:
        db.close()
    return Response(content=xml, media_type="application/xml")


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

    def _index_with_seo(full_path: str) -> HTMLResponse:
        """Отдаёт index.html с серверно внедрёнными мета-тегами по маршруту."""
        try:
            with open(_INDEX, "r", encoding="utf-8") as f:
                html_doc = f.read()
            db = SessionLocal()
            try:
                head = seo.build_head(full_path, db)
            finally:
                db.close()
            html_doc = seo.inject_head(html_doc, head)
            return HTMLResponse(content=html_doc)
        except Exception:
            # При любой ошибке — отдаём обычный index.html, чтобы не уронить SPA.
            return FileResponse(_INDEX)

    # Catch-all регистрируем ПОСЛЕДНИМ, чтобы /api/*, /uploads/*, /healthz
    # успели сматчиться выше. Файлы из корня сборки (favicon, manifest) —
    # отдаём как есть, всё остальное — index.html (с SEO) для React Router.
    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        candidate = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return _index_with_seo(full_path)
