import mimetypes
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

# Прод определяем по не-SQLite БД (на проде — PostgreSQL). В проде прячем
# интерактивную схему API (/docs, /openapi.json) — меньше раскрываем поверхность.
_IS_PROD = not settings.DATABASE_URL.startswith("sqlite")
app = FastAPI(
    title="Дом Союзов CMS API",
    version="1.0.0",
    docs_url=None if _IS_PROD else "/docs",
    redoc_url=None if _IS_PROD else "/redoc",
    openapi_url=None if _IS_PROD else "/openapi.json",
)

# CORS с credentials несовместим с origin "*" — и это опасно. Не допускаем.
_cors_origins = settings.cors_origins_list
if "*" in _cors_origins:
    raise RuntimeError(
        "CORS_ORIGINS не может содержать '*' при allow_credentials=True. "
        "Перечислите конкретные домены."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Content-Security-Policy для HTML-документа SPA — основной барьер против XSS.
#
# Почему именно так:
#   • script-src   — свои бандлы + тег Яндекс.Метрики (mc.yandex.ru). 'unsafe-inline'
#                    НЕ нужен: счётчик подключается через createElement, а JSON-LD
#                    (<script type="application/ld+json">) браузером не исполняется
#                    и под script-src не подпадает;
#   • style-src    — 'unsafe-inline' обязателен: framer-motion анимирует элементы
#                    через атрибут style, без него анимации по всему сайту встанут;
#   • frame-src    — iframe карты на странице «Контакты» (yandex.ru/map-widget);
#   • object-src   — 'none' и base-uri 'self' закрывают классические обходы CSP;
#   • frame-ancestors дублирует X-Frame-Options (его понимают современные браузеры).
_CSP = "; ".join([
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://mc.yandex.ru https://yandex.ru",
    "media-src 'self' blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' https://mc.yandex.ru",
    "connect-src 'self' https://mc.yandex.ru",
    "frame-src https://yandex.ru https://mc.yandex.ru",
    "upgrade-insecure-requests",
])


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

    # CSP вешаем только на HTML-документ. /uploads уже отдаёт собственный
    # `sandbox` (setdefault его не перезапишет), а /docs и /redoc в dev
    # рисуются инлайновыми скриптами Swagger — им строгая политика помешает.
    if response.headers.get("content-type", "").startswith("text/html") and not request.url.path.startswith(
        ("/docs", "/redoc")
    ):
        response.headers.setdefault("Content-Security-Policy", _CSP)
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
                # Загруженный файл (напр. вредоносный SVG) при прямом открытии
                # не должен исполнять скрипты в origin сайта. `sandbox` блокирует
                # JS в документе, но не мешает встраиванию через <img>.
                "Content-Security-Policy": "sandbox",
                "X-Content-Type-Options": "nosniff",
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
    # Защита от traversal: имя файла не должно содержать путей.
    safe_name = os.path.basename(filename)
    path = os.path.join(settings.UPLOAD_DIR, safe_name)
    if os.path.isfile(path):
        return FileResponse(
            path,
            headers={"Content-Security-Policy": "sandbox", "X-Content-Type-Options": "nosniff"},
        )
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


# ── Статика с долгим кэшем ───────────────────────────────────────────────────
# Python-таблица mimetypes не знает woff2 и отдавала шрифты как text/plain.
# Из-за этого браузер игнорировал <link rel="preload" type="font/woff2">
# и грузил такие шрифты повторно.
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")


class ImmutableStaticFiles(StaticFiles):
    """
    StaticFiles + явный Cache-Control на год.

    Без заголовка браузер применяет эвристику: считает файл свежим лишь ~10%
    от его возраста. Сразу после деплоя это почти ноль, поэтому бандлы и шрифты
    перезапрашивались на каждой загрузке.

    Годится только для файлов с неизменяемым содержимым: у бандлов Vite хэш в
    имени, у шрифтов имя кодирует семейство/начертание/подмножество. При замене
    самого файла шрифта его нужно переименовать, иначе у клиентов останется
    старая версия из кэша.
    """

    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response


# ── SPA: раздаём собранный фронт тем же процессом ────────────────────────────
# Каталог задаётся переменной STATIC_DIR (см. Dockerfile в корне репо).
# Если статика не подмонтирована — гасим SPA-раздачу: удобно для dev-режима,
# где фронт крутится отдельно на Vite (порт 5173).
STATIC_DIR = os.environ.get("STATIC_DIR", "")
if STATIC_DIR and os.path.isdir(STATIC_DIR):
    _ASSETS = os.path.join(STATIC_DIR, "assets")
    if os.path.isdir(_ASSETS):
        app.mount("/assets", ImmutableStaticFiles(directory=_ASSETS), name="assets")

    # Шрифты раздаём отдельным монтированием, а не catch-all'ом: иначе каждый
    # .woff2 уходил с Content-Type text/plain и без Cache-Control.
    _FONTS = os.path.join(STATIC_DIR, "fonts")
    if os.path.isdir(_FONTS):
        app.mount("/fonts", ImmutableStaticFiles(directory=_FONTS), name="fonts")

    _INDEX = os.path.join(STATIC_DIR, "index.html")

    # index.html НЕ кэшируем: иначе браузер (особенно Safari на iOS) держит
    # старую оболочку и тянет старый хэшированный бандл после деплоя. Сами
    # ассеты в /assets кэшируются надолго — у них хэш в имени.
    _INDEX_HEADERS = {"Cache-Control": "no-cache, must-revalidate"}

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
            return HTMLResponse(content=html_doc, headers=_INDEX_HEADERS)
        except Exception:
            # При любой ошибке — отдаём обычный index.html, чтобы не уронить SPA.
            return FileResponse(_INDEX, headers=_INDEX_HEADERS)

    # Catch-all регистрируем ПОСЛЕДНИМ, чтобы /api/*, /uploads/*, /healthz
    # успели сматчиться выше. Файлы из корня сборки (favicon, manifest) —
    # отдаём как есть, всё остальное — index.html (с SEO) для React Router.
    _STATIC_ROOT = os.path.realpath(STATIC_DIR)

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        candidate = os.path.realpath(os.path.join(STATIC_DIR, full_path))
        # Защита от path traversal: файл отдаём, только если он реально лежит
        # внутри STATIC_DIR (иначе «../../etc/passwd» и т.п. читались бы с диска).
        within_static = candidate == _STATIC_ROOT or candidate.startswith(_STATIC_ROOT + os.sep)
        if full_path and within_static and os.path.isfile(candidate):
            return FileResponse(candidate)
        return _index_with_seo(full_path)
