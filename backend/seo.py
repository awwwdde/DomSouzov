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

# ──────────── GEO / бренд ────────────
# Координаты здания (Большая Дмитровка, 1, Москва) — для гео-таргетинга и schema.org.
GEO_LAT = "55.7596"
GEO_LON = "37.6156"
VENUE_STREET = "Большая Дмитровка, 1"
VENUE_CITY = "Москва"
VENUE_POSTAL = "125009"

# Базовые бренд-ключевики: подмешиваются в keywords каждой страницы, чтобы
# любой материал (новость/афиша) в выдаче «бился» с Домом Союзов и Москвой.
BRAND_KEYWORDS = [
    "Дом Союзов",
    "Колонный зал",
    "Большая Дмитровка 1",
    "Москва",
]


def _dedup(items: list[str]) -> list[str]:
    """Убирает пустые и дубликаты (без учёта регистра), сохраняя порядок."""
    seen: set[str] = set()
    out: list[str] = []
    for it in items:
        s = (it or "").strip()
        if not s:
            continue
        key = s.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(s)
    return out


def _telephone(db: Session) -> str:
    """Телефон из настроек (phone/contact_phone), если задан реальный (не нули)."""
    from models import SiteSettings
    for key in ("phone", "contact_phone"):
        row = db.query(SiteSettings).filter_by(key=key).first()
        val = (row.value_ru if row else "") or ""
        digits = re.sub(r"\D", "", val)
        # Отсекаем плейсхолдеры (напр. +7 495 000-00-00) — длинные серии нулей.
        if digits and len(digits) >= 7 and not re.search(r"0{5,}", digits):
            return val.strip()
    return ""


def _venue_place(db: Session) -> dict:
    """schema.org Place здания с адресом и гео-координатами (для location)."""
    place = {
        "@type": "Place",
        "name": SITE_NAME_RU,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": VENUE_STREET,
            "addressLocality": VENUE_CITY,
            "postalCode": VENUE_POSTAL,
            "addressCountry": "RU",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": GEO_LAT, "longitude": GEO_LON},
    }
    tel = _telephone(db)
    if tel:
        place["telephone"] = tel
    return place


def _event_end_date(e) -> str:
    """Последняя дата мультидат-расписания (для schema.org endDate). Пусто, если одиночная."""
    import json as _json
    raw = getattr(e, "dates", None)
    if not raw:
        return ""
    try:
        arr = _json.loads(raw)
    except Exception:
        return ""
    if not isinstance(arr, list) or len(arr) < 2:
        return ""
    last = arr[-1]
    if isinstance(last, dict) and last.get("date"):
        return str(last["date"])
    return ""


def _breadcrumb(items: list[tuple[str, str]]) -> dict:
    """BreadcrumbList: список (название, URL) → schema.org для «хлебных крошек» в выдаче."""
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, "item": url}
            for i, (name, url) in enumerate(items)
        ],
    }

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
    "organizers": ("Организаторам — залы Дома Союзов", "Исторические залы Дома Союзов для концертов, церемоний, форумов и съёмок."),
    "audience": ("Зрителям — Дом Союзов", "Правила посещения Дома Союзов: билеты, гардероб, дресс-код, доступная среда."),
    "contacts": ("Контакты — Дом Союзов", "Адрес, телефон и схема проезда к Дому Союзов: Большая Дмитровка 1, Москва."),
    "news": ("Новости — Дом Союзов", "Новости, анонсы и пресс-релизы Дома Союзов."),
    "privacy-policy": ("Политика конфиденциальности — Дом Союзов", "Политика обработки персональных данных Дома Союзов."),
    "personal-data-consent": ("Согласие на обработку ПД — Дом Союзов", "Согласие на обработку персональных данных."),
}

# Доп. ключевики под конкретный статический маршрут (к BRAND_KEYWORDS).
STATIC_KEYWORDS = {
    "": ["концертный зал Москва", "афиша", "концерты", "церемонии", "1784"],
    "events": ["афиша", "афиша Москва", "концерты", "мероприятия", "купить билет"],
    "about": ["история", "архитектура", "Колонный зал история"],
    "halls": ["аренда зала", "Колонный зал", "Октябрьский зал", "вместимость"],
    "gallery": ["галерея", "фото", "интерьеры", "съёмки"],
    "organizers": ["аренда зала Москва", "площадка для мероприятий", "съёмки", "форум", "церемония"],
    "audience": ["билеты", "правила посещения", "доступная среда", "как добраться"],
    "contacts": ["адрес", "телефон", "схема проезда", "как добраться"],
    "news": ["новости", "анонсы", "пресс-релизы", "афиша Москва"],
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
    keywords: Optional[list[str]] = None,
    article_tags: Optional[list[str]] = None,
    robots: str = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
) -> str:
    t = html.escape(title, quote=True)
    d = html.escape(description, quote=True)
    img = _abs(image) if image else _abs("og-default.jpg")
    img = html.escape(img, quote=True)
    cu = html.escape(canonical, quote=True)
    parts = [
        f'<title>{t}</title>',
        f'<meta name="description" content="{d}" />',
        f'<meta name="robots" content="{html.escape(robots, quote=True)}" />',
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
    if keywords:
        kw = html.escape(", ".join(_dedup(keywords)), quote=True)
        parts.append(f'<meta name="keywords" content="{kw}" />')
    # article:tag — отдельный тег на каждую метку (Open Graph article).
    for tag in _dedup(article_tags or []):
        parts.append(f'<meta property="article:tag" content="{html.escape(tag, quote=True)}" />')
    if jsonld:
        # Экранируем <, >, & — иначе значение вроде «</script><script>…» из CMS
        # вырвалось бы из тега и дало XSS. \u-последовательности валидны в JSON.
        safe_jsonld = (
            jsonld.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
        )
        parts.append(f'<script type="application/ld+json">{safe_jsonld}</script>')
    return "\n    ".join(parts)


def _org_jsonld(db: Session) -> str:
    import json
    data = {
        "@context": "https://schema.org",
        "@type": "PerformingArtsTheater",
        "name": SITE_NAME_RU,
        "alternateName": SITE_NAME_EN,
        "url": _abs(""),
        "image": _abs("og-default.jpg"),
        "logo": _abs("logo-house.svg"),
        "address": {
            "@type": "PostalAddress",
            "streetAddress": VENUE_STREET,
            "addressLocality": VENUE_CITY,
            "postalCode": VENUE_POSTAL,
            "addressCountry": "RU",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": GEO_LAT, "longitude": GEO_LON},
        "hasMap": f"https://yandex.ru/maps/?text={GEO_LAT},{GEO_LON}",
    }
    tel = _telephone(db)
    if tel:
        data["telephone"] = tel
    website = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME_RU,
        "alternateName": SITE_NAME_EN,
        "url": _abs(""),
        "inLanguage": "ru-RU",
        "publisher": {"@type": "Organization", "name": SITE_NAME_RU, "url": _abs("")},
    }
    return json.dumps([data, website], ensure_ascii=False)


def build_head(path: str, db: Session) -> str:
    """Возвращает HTML-блок мета-тегов для <head> по маршруту SPA."""
    import json

    clean_path = path.strip("/")
    parts = clean_path.split("/") if clean_path else [""]

    # Панель управления — служебный раздел: закрываем от индексации и не
    # показываем посетителю «Страница не найдена» в заголовке вкладки
    # (раньше /admin/* уходил в общий 404-фолбэк в конце функции).
    if parts[0] == "admin":
        return _meta_block(
            title="Панель управления — Дом Союзов",
            description="Служебный раздел сайта.",
            canonical=_abs(clean_path),
            robots="noindex, nofollow",
        )

    # /events/{id}
    if len(parts) == 2 and parts[0] == "events" and parts[1].isdigit():
        e = db.query(Event).filter(Event.id == int(parts[1]), Event.is_active == True).first()
        if e:
            desc_txt = _clean(e.description_ru) or f"{e.title_ru} — {e.date}, {e.hall_ru}. Дом Союзов, Москва."
            # Ключевики: бренд + зал + жанр + название → афиша «бьётся» с Домом Союзов.
            keywords = _dedup(
                BRAND_KEYWORDS + [e.hall_ru, e.tag_ru, e.title_ru, "афиша", "купить билет", "концерт Москва"]
            )
            place = _venue_place(db)
            place["name"] = f"{SITE_NAME_RU}, {e.hall_ru}"
            event_obj = {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": e.title_ru,
                "startDate": e.date,
                "eventStatus": "https://schema.org/EventScheduled",
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "description": desc_txt,
                "image": _abs(e.image) if e.image else _abs("og-default.jpg"),
                "location": place,
                "organizer": {"@type": "Organization", "name": SITE_NAME_RU, "url": _abs("")},
                "performer": {"@type": "Organization", "name": SITE_NAME_RU},
                "keywords": ", ".join(keywords),
                "url": _abs(f"events/{e.id}"),
            }
            # Мультидаты: последняя дата расписания → endDate.
            end_date = _event_end_date(e)
            if end_date:
                event_obj["endDate"] = end_date
            if getattr(e, "has_ticket", False) and getattr(e, "ticket_url", None):
                event_obj["offers"] = {
                    "@type": "Offer",
                    "url": e.ticket_url,
                    "availability": "https://schema.org/InStock",
                    "category": "primary",
                }
            crumbs = _breadcrumb([
                ("Главная", _abs("")),
                ("Афиша", _abs("events")),
                (e.title_ru, _abs(f"events/{e.id}")),
            ])
            jsonld = json.dumps([event_obj, crumbs], ensure_ascii=False)
            return _meta_block(
                title=f"{e.title_ru} — {e.date} · Дом Союзов",
                description=desc_txt,
                canonical=_abs(f"events/{e.id}"),
                image=e.image,
                og_type="event",
                jsonld=jsonld,
                keywords=keywords,
                article_tags=[e.tag_ru, e.hall_ru],
            )

    # /news/{id}
    if len(parts) == 2 and parts[0] == "news" and parts[1].isdigit():
        n = db.query(NewsArticle).filter(NewsArticle.id == int(parts[1]), NewsArticle.is_active == True).first()
        if n:
            desc_txt = _clean(n.excerpt_ru) or _clean(n.content_ru) or f"{n.title_ru}. Новости Дома Союзов."
            published = n.created_at.isoformat() if n.created_at else None
            # Ключевики: бренд + рубрика + название → материал «бьётся» с Домом Союзов.
            keywords = _dedup(
                BRAND_KEYWORDS + [n.tag_ru, n.title_ru, "новости Дома Союзов", "афиша Москва"]
            )
            jsonld_obj = {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": n.title_ru,
                "description": desc_txt,
                "image": _abs(n.image) if n.image else _abs("og-default.jpg"),
                "articleSection": n.tag_ru,
                "keywords": ", ".join(keywords),
                "inLanguage": "ru-RU",
                "author": {"@type": "Organization", "name": SITE_NAME_RU, "url": _abs("")},
                "publisher": {
                    "@type": "Organization",
                    "name": SITE_NAME_RU,
                    "url": _abs(""),
                    "logo": {"@type": "ImageObject", "url": _abs("logo-house.svg")},
                },
                "mainEntityOfPage": _abs(f"news/{n.id}"),
            }
            if published:
                jsonld_obj["datePublished"] = published
                jsonld_obj["dateModified"] = published
            crumbs = _breadcrumb([
                ("Главная", _abs("")),
                ("Архив мероприятий", _abs("news")),
                (n.title_ru, _abs(f"news/{n.id}")),
            ])
            return _meta_block(
                title=f"{n.title_ru} · Дом Союзов",
                description=desc_txt,
                canonical=_abs(f"news/{n.id}"),
                image=n.image,
                og_type="article",
                jsonld=json.dumps([jsonld_obj, crumbs], ensure_ascii=False),
                keywords=keywords,
                article_tags=[n.tag_ru],
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
                keywords=_dedup(BRAND_KEYWORDS + [cat.name_ru, "галерея", "фото", "интерьеры"]),
            )

    # Статические маршруты
    if clean_path in STATIC_ROUTES:
        title, description = STATIC_ROUTES[clean_path]
        return _meta_block(
            title=title,
            description=description,
            canonical=_abs(clean_path),
            og_type="website",
            jsonld=_org_jsonld(db) if clean_path == "" else None,
            keywords=_dedup(BRAND_KEYWORDS + STATIC_KEYWORDS.get(clean_path, [])),
        )

    # Фолбэк (неизвестный маршрут) — не индексируем.
    return _meta_block(
        title="Страница не найдена — Дом Союзов",
        description=DEFAULT_DESC_RU,
        canonical=_abs(clean_path),
        robots="noindex, nofollow",
    )


# ──────────── HTML injection ────────────

_TITLE_RE = re.compile(r"<title>.*?</title>", re.IGNORECASE | re.DOTALL)
# Удаляем дефолтные SEO-мета из index.html, чтобы не было дублей с инъекцией.
_SEO_META_RE = re.compile(
    r'\s*<meta[^>]+(?:name="description"|name="keywords"|name="robots"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>',
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
        if route in {"privacy-policy", "personal-data-consent"}:
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
    # AI-краулеры перечислены явно и ДОПУЩЕНЫ — чтобы материалы Дома Союзов
    # попадали в ответы ChatGPT/Perplexity/Gemini/Яндекс Нейро и т.п.
    ai_bots = [
        "GPTBot", "OAI-SearchBot", "ChatGPT-User",        # OpenAI
        "ClaudeBot", "Claude-Web", "anthropic-ai",          # Anthropic
        "PerplexityBot", "Perplexity-User",                 # Perplexity
        "Google-Extended",                                   # Gemini / Vertex
        "Applebot-Extended",                                 # Apple Intelligence
        "Amazonbot", "Bytespider", "CCBot",                 # Amazon / прочие
        "YandexAdditional", "YandexAdditionalBot",          # Яндекс Нейро
        "Meta-ExternalAgent", "FacebookBot",
    ]
    lines: list[str] = []
    for bot in ai_bots:
        lines.append(f"User-agent: {bot}")
        lines.append("Allow: /")
        lines.append("Disallow: /admin")
        lines.append("Disallow: /api/")
        lines.append("")
    lines.append("User-agent: *")
    lines.append("Allow: /")
    lines.append("Disallow: /admin")
    lines.append("Disallow: /api/")
    lines.append("")
    lines.append(f"Sitemap: {base}/sitemap.xml")
    # llms.txt — машиночитаемая «выжимка» сайта для LLM (llmstxt.org).
    lines.append(f"# LLM overview: {base}/llms.txt")
    return "\n".join(lines) + "\n"


def build_llms_txt(db: Session) -> str:
    """Машиночитаемая выжимка сайта для LLM (формат llmstxt.org).

    Краткое описание + структурированные ссылки на ключевые разделы, ближайшую
    афишу и свежие новости — чтобы AI-ассистенты точно отвечали о Доме Союзов.
    """
    base = settings.SITE_URL.rstrip("/")
    tel = _telephone(db)
    out: list[str] = []
    out.append("# Дом Союзов (House of Unions)")
    out.append("")
    out.append(
        "> Историческая концертная и церемониальная площадка в самом центре Москвы. "
        "Знаменитый Колонный зал известен с 1784 года: здесь проходят концерты, "
        "церемонии, публичные программы, съёмки; залы доступны для аренды организаторам."
    )
    out.append("")
    out.append("## Контакты и адрес")
    out.append(f"- Адрес: {VENUE_STREET}, {VENUE_CITY}, {VENUE_POSTAL}, Россия")
    out.append(f"- Координаты: {GEO_LAT}, {GEO_LON}")
    if tel:
        out.append(f"- Телефон: {tel}")
    out.append(f"- Сайт: {base}/")
    out.append("")

    halls = db.query(Hall).order_by(Hall.sort_order).all()
    if halls:
        out.append("## Залы")
        for h in halls:
            cap = f" — вместимость {h.capacity}" if h.capacity else ""
            out.append(f"- {h.name_ru}{cap}")
        out.append("")

    events = (
        db.query(Event)
        .filter(Event.is_active == True)
        .order_by(desc(Event.created_at))
        .limit(30)
        .all()
    )
    if events:
        out.append("## Афиша (ближайшие мероприятия)")
        for e in events:
            out.append(f"- [{e.title_ru}]({base}/events/{e.id}) — {e.date}, {e.time}, {e.hall_ru} ({e.tag_ru})")
        out.append("")

    news = (
        db.query(NewsArticle)
        .filter(NewsArticle.is_active == True)
        .order_by(desc(NewsArticle.created_at))
        .limit(20)
        .all()
    )
    if news:
        out.append("## Новости и анонсы")
        for n in news:
            date_s = n.created_at.date().isoformat() if n.created_at else ""
            suffix = f" — {date_s}" if date_s else ""
            out.append(f"- [{n.title_ru}]({base}/news/{n.id}){suffix}")
        out.append("")

    out.append("## Разделы сайта")
    out.append(f"- [Афиша]({base}/events) — расписание концертов и мероприятий")
    out.append(f"- [Залы]({base}/halls) — Колонный и Октябрьский залы")
    out.append(f"- [О Доме]({base}/about) — история и архитектура")
    out.append(f"- [Галерея]({base}/gallery) — фотографии интерьеров и событий")
    out.append(f"- [Организаторам]({base}/organizers) — аренда залов")
    out.append(f"- [Зрителям]({base}/audience) — правила посещения")
    out.append(f"- [Контакты]({base}/contacts) — адрес и схема проезда")
    out.append("")
    out.append("## Дополнительно")
    out.append(f"- [Карта сайта]({base}/sitemap.xml)")
    out.append(f"- [Лента новостей RSS]({base}/rss.xml)")
    out.append("")
    return "\n".join(out)


def build_rss(db: Session) -> str:
    """RSS 2.0 для новостей Дома Союзов — для агрегаторов и AI-краулеров."""
    base = settings.SITE_URL.rstrip("/")

    def esc(s: str) -> str:
        return html.escape(s or "", quote=True)

    news = (
        db.query(NewsArticle)
        .filter(NewsArticle.is_active == True)
        .order_by(desc(NewsArticle.created_at))
        .limit(50)
        .all()
    )
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<rss version="2.0">')
    lines.append("  <channel>")
    lines.append(f"    <title>{esc(SITE_NAME_RU)} — Новости</title>")
    lines.append(f"    <link>{esc(base + '/news')}</link>")
    lines.append(f"    <description>{esc(DEFAULT_DESC_RU)}</description>")
    lines.append("    <language>ru-RU</language>")
    for n in news:
        link = f"{base}/news/{n.id}"
        desc_txt = _clean(n.excerpt_ru) or _clean(n.content_ru) or n.title_ru
        item = ["    <item>"]
        item.append(f"      <title>{esc(n.title_ru)}</title>")
        item.append(f"      <link>{esc(link)}</link>")
        item.append(f'      <guid isPermaLink="true">{esc(link)}</guid>')
        if n.tag_ru:
            item.append(f"      <category>{esc(n.tag_ru)}</category>")
        if n.created_at:
            # RFC-822 дата для RSS.
            item.append(f"      <pubDate>{n.created_at.strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>")
        item.append(f"      <description>{esc(desc_txt)}</description>")
        item.append("    </item>")
        lines.append("\n".join(item))
    lines.append("  </channel>")
    lines.append("</rss>")
    return "\n".join(lines)
