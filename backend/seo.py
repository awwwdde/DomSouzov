"""SEO: серверная инъекция мета-тегов в index.html и генерация sitemap/robots.

Прод раздаёт SPA из FastAPI (см. main.py spa_fallback). Краулеры Яндекс/Google
не выполняют JS надёжно, поэтому правильные <title>/description/og/JSON-LD должны
быть уже в HTML, который отдаёт сервер. На клиенте те же теги поддерживает
react-helmet при SPA-навигации.
"""
from __future__ import annotations

import html
import re
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session

from config import settings
from models import Event, NewsArticle, GalleryCategory, Hall


SITE_NAME_RU = "Дом Союзов"
SITE_NAME_EN = "House of Unions"
DEFAULT_DESC_RU = (
    "Дом Союзов — историческая концертная и церемониальная площадка в центре Москвы. "
    "Колонный зал с 1784 года: концерты, церемонии, публичные программы и съёмки."
)
DEFAULT_DESC_EN = (
    "House of Unions — a historic concert and ceremonial venue in the heart of Moscow. "
    "The Hall of Columns since 1784: concerts, ceremonies, public programmes and filming."
)

# Статические публичные маршруты и их title/description (RU — основной язык сайта).
STATIC_ROUTES = {
    "": ("Дом Союзов — Колонный зал, Большая Дмитровка 1", DEFAULT_DESC_RU),
    "events": ("Афиша — Дом Союзов", "Афиша концертов, церемоний и публичных программ Дома Союзов в Москве."),
    "about": ("О Доме — Дом Союзов", "История, архитектура и сегодняшний день Дома Союзов и Колонного зала."),
    "halls": ("Залы — Дом Союзов", "Колонный, Октябрьский и Малый залы Дома Союзов: вместимость, площадь, оснащение."),
    "gallery": ("Галерея — Дом Союзов", "Фотогалерея интерьеров и событий Дома Союзов."),
    "organizers": ("Организаторам — аренда залов Дома Союзов", "Аренда исторических залов Дома Союзов для концертов, церемоний, форумов и съёмок."),
    "audience": ("Зрителям — Дом Союзов", "Правила посещения Дома Союзов: билеты, гардероб, дресс-код, доступная среда."),
    "contacts": ("Контакты — Дом Союзов", "Адрес, телефон и схема проезда к Дому Союзов: Большая Дмитровка 1, Москва."),
    "news": ("Новости — Дом Союзов", "Новости, анонсы и пресс-релизы Дома Союзов."),
    "privacy-policy": ("Политика конфиденциальности — Дом Союзов", "Политика обработки персональных данных Дома Союзов."),
    "personal-data-consent": ("Согласие на обработку ПД — Дом Союзов", "Согласие на обработку персональных данных."),
    "terms": ("Пользовательское соглашение — Дом Союзов", "Условия использования сайта Дома Союзов."),
}


def _abs(path: str) -> str:
    base = settings.SITE_URL.rstrip("/")
    if not path:
        return base + "/"
    if path.startswith("http"):
        return path
    return base + "/" + path.lstrip("/")


def _clean(text: Optional[str], limit: int = 300) -> str:
    if not text:
        return ""
    t = re.sub(r"<[^>]+>", " ", text)       # вырезаем разметку
    t = re.sub(r"\s+", " ", t).strip()
    if len(t) > limit:
        t = t[: limit - 1].rstrip() + "…"
    return t


def _meta_block(
    *,
    title: str,
    description: str,
    canonical: str,
    image: Optional[str] = None,
    og_type: str = "website",
    jsonld: Optional[str] = None,
) -> str:
    t = html.escape(title, quote=True)
    d = html.escape(description, quote=True)
    img = _abs(image) if image else _abs("og-default.jpg")
    img = html.escape(img, quote=True)
    cu = html.escape(canonical, quote=True)
    parts = [
        f'<title>{t}</title>',
        f'<meta name="description" content="{d}" />',
        f'<link rel="canonical" href="{cu}" />',
        f'<meta property="og:site_name" content="{SITE_NAME_RU}" />',
        f'<meta property="og:locale" content="ru_RU" />',
        f'<meta property="og:type" content="{og_type}" />',
        f'<meta property="og:title" content="{t}" />',
        f'<meta property="og:description" content="{d}" />',
        f'<meta property="og:url" content="{cu}" />',
        f'<meta property="og:image" content="{img}" />',
        f'<meta name="twitter:card" content="summary_large_image" />',
        f'<meta name="twitter:title" content="{t}" />',
        f'<meta name="twitter:description" content="{d}" />',
        f'<meta name="twitter:image" content="{img}" />',
    ]
    if jsonld:
        parts.append(f'<script type="application/ld+json">{jsonld}</script>')
    return "\n    ".join(parts)


def _org_jsonld() -> str:
    import json
    data = {
        "@context": "https://schema.org",
        "@type": "PerformingArtsTheater",
        "name": SITE_NAME_RU,
        "alternateName": SITE_NAME_EN,
        "url": _abs(""),
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Большая Дмитровка, 1",
            "addressLocality": "Москва",
            "addressCountry": "RU",
        },
    }
    return json.dumps(data, ensure_ascii=False)


def build_head(path: str, db: Session) -> str:
    """Возвращает HTML-блок мета-тегов для <head> по маршруту SPA."""
    import json

    clean_path = path.strip("/")
    parts = clean_path.split("/") if clean_path else [""]

    # /events/{id}
    if len(parts) == 2 and parts[0] == "events" and parts[1].isdigit():
        e = db.query(Event).filter(Event.id == int(parts[1]), Event.is_active == True).first()
        if e:
            desc_txt = _clean(e.description_ru) or f"{e.title_ru} — {e.date}, {e.hall_ru}. Дом Союзов, Москва."
            jsonld = json.dumps(
                {
                    "@context": "https://schema.org",
                    "@type": "Event",
                    "name": e.title_ru,
                    "startDate": e.date,
                    "description": desc_txt,
                    "image": _abs(e.image) if e.image else _abs("og-default.jpg"),
                    "location": {
                        "@type": "Place",
                        "name": f"{SITE_NAME_RU}, {e.hall_ru}",
                        "address": {"@type": "PostalAddress", "streetAddress": "Большая Дмитровка, 1", "addressLocality": "Москва", "addressCountry": "RU"},
                    },
                    "organizer": {"@type": "Organization", "name": SITE_NAME_RU, "url": _abs("")},
                    "url": _abs(f"events/{e.id}"),
                },
                ensure_ascii=False,
            )
            return _meta_block(
                title=f"{e.title_ru} — {e.date} · Дом Союзов",
                description=desc_txt,
                canonical=_abs(f"events/{e.id}"),
                image=e.image,
                og_type="event",
                jsonld=jsonld,
            )

    # /news/{id}
    if len(parts) == 2 and parts[0] == "news" and parts[1].isdigit():
        n = db.query(NewsArticle).filter(NewsArticle.id == int(parts[1]), NewsArticle.is_active == True).first()
        if n:
            desc_txt = _clean(n.excerpt_ru) or _clean(n.content_ru) or f"{n.title_ru}. Новости Дома Союзов."
            published = n.created_at.isoformat() if n.created_at else None
            jsonld_obj = {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": n.title_ru,
                "description": desc_txt,
                "image": _abs(n.image) if n.image else _abs("og-default.jpg"),
                "publisher": {"@type": "Organization", "name": SITE_NAME_RU, "url": _abs("")},
                "mainEntityOfPage": _abs(f"news/{n.id}"),
            }
            if published:
                jsonld_obj["datePublished"] = published
            return _meta_block(
                title=f"{n.title_ru} · Дом Союзов",
                description=desc_txt,
                canonical=_abs(f"news/{n.id}"),
                image=n.image,
                og_type="article",
                jsonld=json.dumps(jsonld_obj, ensure_ascii=False),
            )

    # /gallery/{slug}
    if len(parts) == 2 and parts[0] == "gallery":
        cat = db.query(GalleryCategory).filter(GalleryCategory.slug == parts[1]).first()
        if cat:
            return _meta_block(
                title=f"{cat.name_ru} — Галерея · Дом Союзов",
                description=f"{cat.name_ru} — фотогалерея Дома Союзов.",
                canonical=_abs(f"gallery/{cat.slug}"),
                image=cat.cover_image,
            )

    # Статические маршруты
    if clean_path in STATIC_ROUTES:
        title, description = STATIC_ROUTES[clean_path]
        return _meta_block(
            title=title,
            description=description,
            canonical=_abs(clean_path),
            og_type="website",
            jsonld=_org_jsonld() if clean_path == "" else None,
        )

    # Фолбэк (неизвестный маршрут) — не индексируем.
    return (
        '<meta name="robots" content="noindex, nofollow" />\n    '
        + _meta_block(
            title="Страница не найдена — Дом Союзов",
            description=DEFAULT_DESC_RU,
            canonical=_abs(clean_path),
        )
    )


# ──────────── HTML injection ────────────

_TITLE_RE = re.compile(r"<title>.*?</title>", re.IGNORECASE | re.DOTALL)
# Удаляем дефолтные SEO-мета из index.html, чтобы не было дублей с инъекцией.
_SEO_META_RE = re.compile(
    r'\s*<meta[^>]+(?:name="description"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>',
    re.IGNORECASE,
)
_CANONICAL_RE = re.compile(r'\s*<link[^>]+rel="canonical"[^>]*>', re.IGNORECASE)


def inject_head(index_html: str, head_block: str) -> str:
    """Убирает дефолтные title/description/og/twitter/canonical и вставляет
    свежий SEO-блок перед </head> — в ответе ровно один набор тегов."""
    html_out = _TITLE_RE.sub("", index_html, count=1)
    html_out = _SEO_META_RE.sub("", html_out)
    html_out = _CANONICAL_RE.sub("", html_out)
    if "</head>" in html_out:
        html_out = html_out.replace("</head>", f"    {head_block}\n  </head>", 1)
    return html_out


# ──────────── sitemap / robots ────────────

def build_sitemap(db: Session) -> str:
    urls: list[tuple[str, Optional[str]]] = []

    for route in STATIC_ROUTES:
        # правовые страницы в карту не добавляем
        if route in {"privacy-policy", "personal-data-consent", "terms"}:
            continue
        urls.append((_abs(route), None))

    for e in db.query(Event).filter(Event.is_active == True).order_by(desc(Event.created_at)).all():
        urls.append((_abs(f"events/{e.id}"), None))

    for n in db.query(NewsArticle).filter(NewsArticle.is_active == True).order_by(desc(NewsArticle.created_at)).all():
        lastmod = n.created_at.date().isoformat() if n.created_at else None
        urls.append((_abs(f"news/{n.id}"), lastmod))

    for c in db.query(GalleryCategory).order_by(GalleryCategory.sort_order).all():
        urls.append((_abs(f"gallery/{c.slug}"), None))

    today = datetime.now(timezone.utc).date().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod in urls:
        lm = lastmod or today
        lines.append(f"  <url><loc>{html.escape(loc)}</loc><lastmod>{lm}</lastmod></url>")
    lines.append("</urlset>")
    return "\n".join(lines)


def build_robots() -> str:
    base = settings.SITE_URL.rstrip("/")
    return (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin\n"
        "Disallow: /api/\n\n"
        f"Sitemap: {base}/sitemap.xml\n"
    )
