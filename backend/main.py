import os
import re
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, PlainTextResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

# Ensure imports always resolve to this local backend folder first.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import text as _sql_text
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


_RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")
# Размер отдаваемого куска: открытые/большие Range-запросы режем чанками, чтобы
# не вытаскивать из БД весь видеофайл и быстро стартовать воспроизведение.
_STREAM_CHUNK = 2 * 1024 * 1024  # 2 МБ
_IS_SQLITE = settings.DATABASE_URL.startswith("sqlite")


def _read_blob_slice(db, media_id: int, start: int, length: int) -> bytes:
    """Читает из БД только нужный кусок файла, не загружая весь блоб в память."""
    if length <= 0:
        return b""
    # substr/substring — 1-индексные, поэтому start + 1.
    if _IS_SQLITE:
        sql = "SELECT substr(data, :s, :l) FROM media_files WHERE id = :id"
    else:
        sql = "SELECT substring(data FROM :s FOR :l) FROM media_files WHERE id = :id"
    row = db.execute(_sql_text(sql), {"s": start + 1, "l": length, "id": media_id}).first()
    if not row or row[0] is None:
        return b""
    return bytes(row[0])


@app.get("/uploads/{filename}", include_in_schema=False)
def serve_upload(filename: str, request: Request):
    db = SessionLocal()
    try:
        # Тянем только метаданные (id/тип/размер) — без самого блоба.
        meta = (
            db.query(MediaFile.id, MediaFile.content_type, MediaFile.size)
            .filter(MediaFile.filename == filename)
            .first()
        )
        if meta is not None:
            media_id, content_type, size = meta
            media_type = content_type or "application/octet-stream"
            if not size or size <= 0:
                # Легаси-строки без size — разово берём длину блоба.
                blob = db.query(MediaFile.data).filter(MediaFile.id == media_id).scalar() or b""
                size = len(blob)
            base_headers = {
                "Cache-Control": "public, max-age=31536000, immutable",
                "Accept-Ranges": "bytes",
            }
            range_header = request.headers.get("range")
            if range_header:
                mr = _RANGE_RE.match(range_header.strip())
                if mr:
                    start_s, end_s = mr.group(1), mr.group(2)
                    if start_s == "" and end_s == "":
                        start, end = 0, size - 1
                    elif start_s == "":  # суффиксный запрос: последние N байт
                        n = int(end_s)
                        start, end = max(0, size - n), size - 1
                    else:
                        start = int(start_s)
                        end = int(end_s) if end_s else size - 1
                    if start >= size:
                        return Response(
                            status_code=416,
                            headers={**base_headers, "Content-Range": f"bytes */{size}"},
                        )
                    end = min(end, size - 1)
                    # Чанк: не отдаём больше _STREAM_CHUNK за раз (быстрый старт + лёгкая БД).
                    end = min(end, start + _STREAM_CHUNK - 1)
                    chunk = _read_blob_slice(db, media_id, start, end - start + 1)
                    return Response(
                        content=chunk,
                        status_code=206,
                        media_type=media_type,
                        headers={
                            **base_headers,
                            "Content-Range": f"bytes {start}-{end}/{size}",
                            "Content-Length": str(len(chunk)),
                        },
                    )
            # Без Range (картинки, документы) — отдаём целиком.
            blob = db.query(MediaFile.data).filter(MediaFile.id == media_id).scalar() or b""
            return Response(
                content=blob,
                media_type=media_type,
                headers={**base_headers, "Content-Length": str(len(blob))},
            )
    finally:
        db.close()
    # Фолбэк: файл на диске (локальная разработка или legacy). FileResponse
    # сам поддерживает Range/Accept-Ranges.
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


# llms.txt — машиночитаемая выжимка сайта для LLM/AI-ассистентов (llmstxt.org).
@app.get("/llms.txt", include_in_schema=False)
def llms_txt():
    db = SessionLocal()
    try:
        txt = seo.build_llms_txt(db)
    finally:
        db.close()
    return PlainTextResponse(
        txt, headers={"Cache-Control": "public, max-age=3600"}
    )


# RSS-лента новостей — для агрегаторов и AI-краулеров.
@app.get("/rss.xml", include_in_schema=False)
def rss_xml():
    db = SessionLocal()
    try:
        xml = seo.build_rss(db)
    finally:
        db.close()
    return Response(
        content=xml,
        media_type="application/rss+xml",
        headers={"Cache-Control": "public, max-age=1800"},
    )


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
